import React, { Component } from 'react';
import io from 'socket.io-client';
import { Jumbotron } from 'react-bootstrap';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.info('connected to backend');
});

class App extends Component {
  render() {
    return (
      <div className="container">
        <Jumbotron>
          <h1>OSC Simulator</h1>
        </Jumbotron>
        <form>

          <div className="form-group">
            <label>address</label>
            <input type="text" className="form-control" placeholder="test/" />
          </div>

          <div className="form-group">
            <label>string message</label>
            <input type="text" className="form-control" placeholder="boo" />
          </div>

        </form>
      </div>
    );
  }
}

export default App;
