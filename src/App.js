import React, { Component } from 'react';
import io from 'socket.io-client';
import { Col, Jumbotron, FormGroup, FormControl, Button } from 'react-bootstrap';

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
      address: "/test",
      params: [
        {
          type: "string",
          value: "one"
        },
        {
          type: "string",
          value: "two"
        }
      ]
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
    this.updateString = this.updateString.bind(this);
    this.updateInts = this.updateInts.bind(this);
    this.updateBlob = this.updateBlob.bind(this);
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

  updateString(event) {
    this.setState({ stringValue: event.target.value });
  }

  updateBlob(event) {
    this.setState({
      blob: {
        ...this.state.blob,
        [event.target.name]: event.target.value
      }
    })
  }

  updateInts(event) {
    const target = event.target;
    const value = target.value;
    const index = parseInt(target.name);
    const updatedInts = this.state.intValues.map( (entry, i) =>
      i == index ? parseInt(value) : entry
    );
    this.setState({ intValues: updatedInts })
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

          <Col md={4}>
            <FormGroup>
              <label>string arg</label>
              <FormControl type="text" onChange={this.updateString} value={this.state.stringValue} />
            </FormGroup>
            <FormGroup>
              <Button type="button" onClick={() => { this.sendOsc(this.state.address, this.state.stringValue)}}>Send string</Button>
            </FormGroup>
          </Col>

          <Col md={4}>

            <FormGroup>
              <label>int32 arg 0</label>
              <FormControl name="0" type="number" onChange={this.updateInts} value={this.state.intValues[0]} />
            </FormGroup>

            <FormGroup>
              <label>int32 arg 1</label>
              <FormControl name="1" type="number" onChange={this.updateInts} value={this.state.intValues[1]} />
            </FormGroup>
            <FormGroup>
              <Button type="button" onClick={() => { this.sendOsc(this.state.address, this.state.intValues, 'int')}}>Send ints</Button>
            </FormGroup>

          </Col>

          <Col md={4}>
            <FormGroup>
              <label>Simple Blob</label>
              <FormControl type="number" onChange={this.updateBlob} name="id" value={this.state.blob.id} />
              <FormControl type="number" onChange={this.updateBlob} name="x" value={this.state.blob.x} />
              <FormControl type="number" onChange={this.updateBlob} name="y" value={this.state.blob.y} />
            </FormGroup>
            <FormGroup>
              <tt>{JSON.stringify(this.state.blob, null, 4)}</tt>
              <Button type="button" onClick={() => { this.sendOsc(this.state.address, this.blobToArray(this.state.blob))}}>Send simple blob</Button>
            </FormGroup>
          </Col>


        </form>

        <h2>Received OSC @ 127.0.0.1:12345</h2>
        <em>{messagesReceived.length} messages</em>
        <ul>
          {messagesReceived}
        </ul>

      </div>
    );
  }

  blobToArray(blob) {
    return [
      parseInt(blob.id),
      parseFloat(blob.x),
      parseFloat(blob.y)
    ]
  }

  sendOsc(address, data, type) {
    // const parsedValue = (data) => {
    //     if (type === 'int') {
    //       return parseInt(data);
    //     }
    //     if (type === 'string') {
    //       return data;
    //     }
    // }
    console.log('send OSC:', address, data, 'as', typeof(data));
    let ip = this.state.destination.ip;
    let port = this.state.destination.port;
    console.log(ip, port);
    socket.emit('message', { address, data, ip, port });
  }
}

export default App;
