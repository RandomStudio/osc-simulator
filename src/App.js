import React, { Component } from 'react';
import io from 'socket.io-client';
import { Jumbotron, FormGroup, FormControl, Button, ControlLabel } from 'react-bootstrap';

const socket = io('http://localhost:5000');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      received: [],
      address: "/test",
      params: [
        "one"
      ]
    }

    this.updateAddress = this.updateAddress.bind(this);
    this.updateParams = this.updateParams.bind(this);

  }

  componentDidMount() {
    socket.on('connect', () => {
      console.info('connected to backend');

      socket.on('configuration', config => {
        console.log('configuration received:', config);
        if (config.sending && config.receiving) {
          this.setState({ sending: config.sending, receiving: config.receiving });
        }
      });

      socket.on('message', data => {
        // console.log('received message:', data);
        let newMessage = {
          address: data[0],
          message: data,
          timestamp: Date.now()
        }
        this.setState({ received: [...this.state.received, newMessage] });
      });

    });

  }

  updateAddress(event) {
    this.setState({ address: event.target.value });
  }

  updateParams(event) {
    const target = event.target;
    const index = target.name.split('param-')[1];
    let params = this.state.params;
    params[index] = target.value;
    this.setState({ params: params });
  }




  render() {

    const messagesReceived = this.state.received.map( msg =>
      <li key={msg.timestamp}>{JSON.stringify(msg)}</li>
    );

    const customParams = this.state.params.map( (param, index) =>
        <FormGroup key={"param-" + index}>
          <ControlLabel>Param #{index+1}</ControlLabel>
          <FormControl type="text" value={param} onChange={this.updateParams} name={"param-"+index} />
        </FormGroup>
    );

    return (
      <div className="container">
        <Jumbotron>
          <h1>OSC Simulator</h1>
          {!this.state.sending && !this.state.receiving &&
            <code>WARNING: Not connected to backend relay properly</code>
          }
        </Jumbotron>
        <h2>Basic connection test</h2>

        
        {this.state && this.state.sending &&
        <form>
          <h6>Destination: {this.state.sending.ip}:{this.state.sending.port}</h6>
          
          <FormGroup>
          <Button type="button" onClick={() => { this.sendOsc('dummy', ['frombrowser', 0, 0.1])} } bsStyle="success">Dummy Test</Button>
          <p>Sends to {this.state.sending.ip}:{this.state.sending.port} <tt>dummy/</tt> the message <tt>frombrowser, 0, 0.1</tt></p>
          </FormGroup>
        </form>
        }
        
        <hr />
        
        <form>

          <h2>Custom</h2>

          <FormGroup>
            <label>address</label>
            <FormControl type="text" onChange={this.updateAddress} value={this.state.address} />
          </FormGroup>

          <FormGroup>
            {customParams}
          </FormGroup>
          <FormGroup>
            <Button onClick={() => { this.setState( { params: [...this.state.params, "new"] } )}}>Add Param</Button>
            <Button onClick={() => { this.setState( { params: ["one"] } )}}>Reset</Button>
            <Button onClick={() => { this.sendOsc( this.state.address, this.state.params )}} bsStyle="success">Send</Button>
          </FormGroup>

        </form>

        <h2>Received OSC @ 127.0.0.1:12345</h2>
        <em>{messagesReceived.length} messages</em>
        <ul>
          {messagesReceived}
        </ul>

      </div>

    );
  }

  // blobToArray(blob) {
  //   return [
  //     parseInt(blob.id),
  //     parseFloat(blob.x),
  //     parseFloat(blob.y)
  //   ]
  // }

  autoType(array) {
    return array.map( value => isNaN(parseFloat(value)) ? value : parseFloat(value) );
  }

  sendOsc(address, data) {
    console.log('send OSC:', address, data);
    let ip = this.state.destination.ip;
    let port = this.state.destination.port;
    console.log(ip, port, this.autoType(data));
    socket.emit('message', { address, data: this.autoType(data), ip, port });
  }
}

export default App;
