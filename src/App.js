import React, { Component } from 'react';
import io from 'socket.io-client';
import { Jumbotron, FormGroup, FormControl, Button } from 'react-bootstrap';

const socket = io('http://localhost:5000');



class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      received: [],
      destination: {
        ip: "127.0.0.1",
        port: 12345
      },
      address: "test",
      stringMessage: "blabla"
    }

    socket.on('connect', () => {
      console.info('connected to backend');
      socket.on('message', (data) => {
        console.log('received message:', data);
        let newMessage = {
          address: data[0],
          message: data,
          timestamp: Date.now()
        }
        this.setState({ received: [...this.state.received, newMessage] });
      });
    });

    this.updateDestinationIp = this.updateDestinationIp.bind(this);
    this.updateDestinationPort = this.updateDestinationPort.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.updateStringMessage = this.updateStringMessage.bind(this);
  }

  updateDestinationIp(event) {
    this.setState({ destination: { ...this.state.destination, ip: event.target.value } });
  }

  updateDestinationPort(event) {
    this.setState({ destination: { ...this.state.destination, port: event.target.value } });
  }

  updateAddress(event) {
    this.setState({ address: event.target.value });
  }

  updateStringMessage(event) {
    this.setState({ stringMessage: event.target.value });
  }


  render() {

    let messagesReceived = this.state.received.map( (msg) => {
      return (
        <li key={msg.timestamp}>{JSON.stringify(msg)}</li>
      )
    } );

    return (
      <div className="container">
        <Jumbotron>
          <h1>OSC Simulator</h1>
        </Jumbotron>
        <h2>Send OSC</h2>

        <h6>Destination server</h6>

        <form>
          <FormGroup>
            <label>ip address</label>
            <FormControl type="text" onChange={this.updateDestinationIp} value={this.state.destination.ip} />
          </FormGroup>

          <FormGroup>
            <label>port</label>
            <FormControl type="text" onChange={this.updateDestinationPort} value={this.state.destination.port} />
          </FormGroup>

          <FormGroup>
            <Button type="button" onClick={() => { this.sendOsc('dummmy', 'frombrowser')}}>Dummy Test</Button>
            <p>Sends to {this.state.destination.ip}:{this.state.destination.port} <tt>dummy/</tt> the message <tt>frombrowser</tt></p>
          </FormGroup>

          <hr />

          <FormGroup>
            <label>address</label>
            <FormControl type="text" onChange={this.updateAddress} value={this.state.address} />
          </FormGroup>

          <FormGroup>
            <label>string message</label>
            <FormControl type="text" onChange={this.updateStringMessage} value={this.state.stringMessage} />
          </FormGroup>

          <FormGroup>
            <Button type="button" onClick={() => { this.sendOsc(this.state.address, this.state.stringMessage)}}>Dummy Test</Button>
            <p>Sends to {this.state.destination.ip}:{this.state.destination.port} <tt>{this.state.address}</tt> the message <tt>{this.state.stringMessage}</tt></p>
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

  sendOsc(address, data) {
    console.log('send OSC:', address, data);
    let ip = this.state.destination.ip;
    let port = this.state.destination.port;
    console.log(ip, port);
    socket.emit('message', { address, data, ip, port });
  }
}

export default App;
