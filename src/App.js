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
      }
    }

    socket.on('connect', () => {
      console.info('connected to backend');
      socket.on('message', (data) => {
        console.log('received message:', data);
        data.timestamp = Date.now();
        this.setState({ received: [...this.state.received, data] });
      });
    });

    this.updateDestinationIp = this.updateDestinationIp.bind(this);
    this.updateDestinationPort = this.updateDestinationPort.bind(this);
  }

  updateDestinationIp(event) {
    this.setState({ destination: { ip: event.target.value } });
  }

  updateDestinationPort(event) {
    this.setState({ destination: { port: event.target.value } });
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
        <h4>Send OSC</h4>
        <form>

          <FormGroup>
            <h6>Destination server</h6>

            <label>ip address</label>
            <FormControl type="text" onChange={this.updateDestinationIp} value={this.state.destination.ip} />

            <label>port</label>
            <FormControl type="text" onChange={this.updateDestinationPort} value={this.state.destination.port} />
          </FormGroup>

          <FormGroup>
            <Button type="button" onClick={() => { this.sendOsc('dummmy', 'frombrowser')}}>Dummy Test</Button>
          </FormGroup>

          <FormGroup>
            <label>address</label>
            <FormControl type="text" placeholder="test/" />
          </FormGroup>

          <FormGroup>
            <label>string message</label>
            <FormControl type="text" placeholder="boo" />
          </FormGroup>


        </form>

        <h4>Received OSC</h4>
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
