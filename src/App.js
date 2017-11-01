import React, { Component } from 'react';
import io from 'socket.io-client';
import { Jumbotron, Button } from 'react-bootstrap';

const socket = io('http://localhost:5000');



class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      received: []
    }

    socket.on('connect', () => {
      console.info('connected to backend');
      socket.on('message', (data) => {
        console.log('received message:', data);
        this.setState({ received: [...this.state.received, data] });
      });
    });
  }

  render() {

    let messagesReceived = this.state.received.map( (msg) => {
      return (
        <li>{JSON.stringify(msg)}</li>
      )
    } );

    return (
      <div className="container">
        <Jumbotron>
          <h1>OSC Simulator</h1>
        </Jumbotron>
        <h4>Send OSC</h4>
        <form>

          <div className="form-group">
            <Button type="button" onClick={() => { this.sendOsc('dummmy', 'frombrowser')}}>Dummy Test</Button>
          </div>

          <div className="form-group">
            <label>address</label>
            <input type="text" className="form-control" placeholder="test/" />
          </div>

          <div className="form-group">
            <label>string message</label>
            <input type="text" className="form-control" placeholder="boo" />
          </div>


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
    socket.emit('message', { address, data });
  }
}

export default App;
