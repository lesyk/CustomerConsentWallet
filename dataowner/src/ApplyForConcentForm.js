import React, { Component } from 'react';

const Web3 = require('web3');
const ConsentLib = require('consentlib');

class ApplyForConcentForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataOwnerEmail: "datao@example.com",
      password: "password",
      address: "0x9a804CF13E3defb1043D2B81BE95D14C787c94Dc",
      finished: false,
      messages: "Form submitted.",
    };
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  makeConsentRequest = (e) => {
    e.preventDefault();

    this.setState({submitted: true});

    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://node0:8545'));

    let whisper = new ConsentLib.Whisper(web3);
    let consentFlow = new ConsentLib.ConsentFlow(web3, whisper);

    let identity = whisper.newIdentity();
    let ttl = 100;
    let priority = 100;

    web3.personal.unlockAccount(this.state.address, this.state.password);
    web3.eth.defaultAccount = this.state.address;

    consentFlow.discoverIdentityService((err, result, idServiceAddress) => {
        setTimeout(() => {
          consentFlow.registerWhisperId(identity, idServiceAddress, this.state.dataOwnerEmail, ttl, priority)
        }, 200);
    });

    consentFlow.respondEthAddress(identity, this.state.dataOwnerEmail, this.state.address, ttl, priority);

    setTimeout(() => consentFlow.dataRequested().then((result) => {
      this.setState(prevState => ({ messages: prevState.messages + `\nData request received ${result}` }));

      consentFlow.provideData(result.args.customer, result.args.data_requester, result.args.id.toString(10), "http://url.to.the.customer.data/data1.xml").then((result) => {
        this.setState(prevState => ({ messages: prevState.messages + `\nData provided at transaction ${result}`, finished: true }));
      }).catch((error) => {
        this.setState(prevState => ({ messages: prevState.messages + `\nFailed to provide data ${error}`, finished: true }));
      })
    }), 1000);
  }

  render() {
    return (
      <div>
      {this.state.submitted ? (
          <div className="panel panel-default">
            <div className="panel-heading">Log</div>
            <div className="panel-body">
              {this.state.messages.split('\n').map((item, key) => {
                return <span key={key}>{item}<br/></span>
              })}
              {this.state.finished == false &&
                (<span>Mining...</span>)
              }
            </div>
          </div>
        ) : (
          <form className="form-horizontal">
            <div className="form-group">
              <label className="col-sm-2 control-label">Data Owner Email</label>
              <div className="col-sm-10">
                <input className="form-control" type="text" value={this.state.dataOwnerEmail} onChange={this.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label">Password</label>
              <div className="col-sm-10">
                <input className="form-control" type="text" value={this.state.password} onChange={this.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label">Address</label>
              <div className="col-sm-10">
                <input className="form-control" type="text" value={this.state.address} onChange={this.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button className="btn btn-default" onClick={this.makeConsentRequest}>Advertise my self</button>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default ApplyForConcentForm;