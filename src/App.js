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
          <input type="text" class="form-control" placeholder="Text input" />
        </form>
      </div>
    );
  }
}

export default App;
