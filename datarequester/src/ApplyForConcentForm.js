import React, {Component} from "react";

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
      ownerEmail: "datao@example.com",
      submitted: false,
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
  };

  makeConsentRequest = (e) => {
    e.preventDefault();

    this.setState({submitted: true});

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
        setTimeout(() => {
          consentFlow.registerWhisperId(identity, idServiceAddress, this.state.dataRequestorEmail, ttl, priority)
        }, 200);
        setTimeout(() => {
          consentFlow.lookupWhisperIds(identity, idServiceAddress, [this.state.ownerEmail, this.state.customerEmail], ttl, priority, 9000).then((whisperIds) =>
            consentFlow.lookupEthAddresses(identity, whisperIds, ttl, priority, 9000)
          ).then((ethAddresses) =>
            consentFlow.requestConsent(ethAddresses.get(this.state.customerEmail), ethAddresses.get(this.state.ownerEmail), consentId).then((result)=> {
              this.setState(prevState => ({ messages: prevState.messages + `\nConsent requested at transaction ${result}` }));
            }).catch((error) => {
              this.setState(prevState => ({ messages: prevState.messages + `\nFailed to request a consent ${error}`, finished: true }));
            })
          );
        }, 1000);
    });

    setTimeout(() => {
      consentFlow.consentGiven(consentId).then((result) => {
        consentFlow.requestData(result.args.customer, result.args.data_owner, result.args.id.toString(10))
      })
    }, 1000);
    setTimeout(() => {
      consentFlow.dataProvided(consentId).then((result) => {
        this.setState(prevState => ({ messages: prevState.messages + `\nData provided ${result}`, finished: true }));
      }).catch((error) => {
        this.setState(prevState => ({ messages: prevState.messages + `\nFailed read data provided ${error}`, finished: true }));
      })
    }, 1000);
  };

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
              <label className="col-sm-2 control-label">Data Requestor Email</label>
              <div className="col-sm-10">
                <input className="form-control" type="text" name="dataRequestorEmail" value={this.state.dataRequestorEmail} onChange={this.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label">Password</label>
              <div className="col-sm-10">
                <input className="form-control"  type="text" name="password" value={this.state.password} onChange={this.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label">Address</label>
              <div className="col-sm-10">
                <input className="form-control"  type="text" name="address" value={this.state.address} onChange={this.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label">Data Owner Email</label>
              <div className="col-sm-10">
                <input className="form-control"  type="text" name="ownerEmail" value={this.state.ownerEmail} onChange={this.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label">Customer's Email</label>
              <div className="col-sm-10">
                <input className="form-control"  type="text" name="customerEmail" value={this.state.customerEmail} onChange={this.handleChange} />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button className="btn btn-primary" onClick={this.makeConsentRequest}>Apply for Consent</button>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default ApplyForConcentForm;
