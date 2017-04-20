import React, { Component } from 'react';

const Web3 = require('web3');
const ConsentLib = require('consentlib');

class ApplyForConcentForm extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      dataRequestorEmail: "datar@example.com",
      password: "password",
      address: "0xA04A6A76F1E23D80E075f490a2E23daACB65d0A9",
      customerEmail: "person@example.com",
      ownerEmail: "datao@example.com"
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

    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

    let whisper = new ConsentLib.Whisper(web3);
    let consentFlow = new ConsentLib.ConsentFlow(web3, whisper);

    let identity = whisper.newIdentity();
    let ttl = 100;
    let priority = 100;
    let consentId = consentFlow.newConsentId();

    web3.personal.unlockAccount(this.state.address, this.state.password);
    web3.eth.defaultAccount = this.state.address;

    consentFlow.discoverIdentityService((err, result, idServiceAddress) => {
        setTimeout(() => consentFlow.registerWhisperId(identity, idServiceAddress, this.state.dataRequestorEmail, ttl, priority), 200);
        setTimeout(() => {
          consentFlow.lookupWhisperIds(identity, idServiceAddress, [this.state.ownerEmail, this.state.customerEmail], ttl, priority, 9000).then((whisperIds) =>
            consentFlow.lookupEthAddresses(identity, whisperIds, ttl, priority, 9000)
          ).then((ethAddresses) =>
            consentFlow.requestConsent(ethAddresses.get(this.state.customerEmail), ethAddresses.get(this.state.ownerEmail), consentId)
          );
        }, 1000);
    });

    setTimeout(() => consentFlow.consentGiven(consentId).then((result) => consentFlow.requestData(result.args.customer, result.args.data_owner, result.args.id.toString(10))), 1000);
    setTimeout(() => consentFlow.dataProvided(consentId).then((result) => console.log(result)), 1000);    
  }

  render() {  
    return (
      <form className="form-horizontal">
        <div className="form-group">
          <label className="col-sm-2 control-label">Data Requestor Email</label>
          <div className="col-sm-10">
            <input className="form-control" type="text" value={this.state.dataRequestorEmail} onChange={this.handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label">Password</label>
          <div className="col-sm-10">
            <input className="form-control"  type="text" value={this.state.password} onChange={this.handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label">Address</label>
          <div className="col-sm-10">
            <input className="form-control"  type="text" value={this.state.address} onChange={this.handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label">Data Owner Email</label>
          <div className="col-sm-10">
            <input className="form-control"  type="text" value={this.state.ownerEmail} onChange={this.handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label">Customer's Email</label>
          <div className="col-sm-10">
            <input className="form-control"  type="text" value={this.state.customerEmail} onChange={this.handleChange} />
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10">
            <button className="btn btn-primary" onClick={this.makeConsentRequest}>Apply for Consent</button>
          </div>
        </div>
      </form>
    );
  }
}

export default ApplyForConcentForm;