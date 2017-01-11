import Ember from 'ember';

export default Ember.Service.extend({
  web3: Ember.inject.service(),
  nameRegAddress = "0x1D03800D1AF61E25390Fdc16FB30F50399925e8f",
  // code for contract is in ../contracts/AliasContract.sol
  abi = this.web3.eth.contract([ { "constant": false, "inputs": [ { "name": "name", "type": "bytes32" }, { "name": "ref", "type": "address" } ], "name": "addAlias", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "name", "type": "bytes32" } ], "name": "getByAlias", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "bytes32" } ], "name": "namesAddresses", "outputs": [ { "name": "", "type": "address", "value": "0x0000000000000000000000000000000000000000" } ], "payable": false, "type": "function" } ]),

  addAlias: function(name, address) {
    let web3 = this.get("web3").instance();
    let consent = web3.eth.contract(this.get("abi")).at(this.get("nameRegAddress"));
    consent.addAlias(name, address);
  },

  getByAlias: function(name) {
    let web3 = this.get("web3").instance();
    let consent = web3.eth.contract(this.get("abi")).at(this.get("nameRegAddress"));
    return consent.getByAlias(name);
  }
});
