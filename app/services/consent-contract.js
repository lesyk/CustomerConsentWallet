import Ember from 'ember';

export default Ember.Service.extend({
  web3: Ember.inject.service(),

  getConsentContract: function() {
    let web3 = this.get("web3").instance();

    let contractAddress = '0x5b88828C143f02D6B8Ebf993cB955Bacd0c430e2';
    let abi = [ { "constant": true, "inputs": [ { "name": "", "type": "address" }, { "name": "", "type": "uint256" } ], "name": "consents", "outputs": [ { "name": "customer", "type": "address" }, { "name": "data_owner", "type": "address" }, { "name": "id", "type": "string" }, { "name": "state", "type": "uint8" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "data_requester", "type": "address" }, { "name": "data_owner", "type": "address" }, { "name": "id", "type": "string" } ], "name": "revokeConsent", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "data_requester", "type": "address" }, { "name": "data_owner", "type": "address" }, { "name": "id", "type": "string" } ], "name": "giveConsent", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "customer", "type": "address" }, { "name": "data_owner", "type": "address" }, { "name": "id", "type": "string" } ], "name": "requestConsent", "outputs": [], "payable": false, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "customer", "type": "address" }, { "indexed": false, "name": "data_owner", "type": "address" }, { "indexed": false, "name": "data_requester", "type": "address" }, { "indexed": false, "name": "id", "type": "string" } ], "name": "ConsentGiven", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "customer", "type": "address" }, { "indexed": false, "name": "data_owner", "type": "address" }, { "indexed": false, "name": "data_requester", "type": "address" }, { "indexed": false, "name": "id", "type": "string" } ], "name": "ConsentRevoked", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "customer", "type": "address" }, { "indexed": false, "name": "data_owner", "type": "address" }, { "indexed": false, "name": "data_requester", "type": "address" }, { "indexed": false, "name": "id", "type": "string" } ], "name": "ConsentRequested", "type": "event" } ];
    let consent = web3.eth.contract(abi).at(contractAddress);
    return consent;
  }
});
