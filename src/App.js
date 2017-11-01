import React, { Component } from 'react';

import { Jumbotron, Button } from 'react-bootstrap';

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
