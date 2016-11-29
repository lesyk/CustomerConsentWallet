import Ember from 'ember';

export default Ember.Route.extend({
  web3: Ember.inject.service(),

  queryParams: {
    username: {}
  },

  model: function(params) {
    return params.username;
  },

  setupController: function(controller, model) {
    let web3Instance = this.get('web3').getInstance(model);
    let addresses = web3Instance.currentProvider.transaction_signer.getAddresses();
    controller.set("addresses", addresses);
    web3Instance.eth.defaultAccount = addresses[0];
    var balance = web3Instance.eth.getBalance(addresses[0]).toString(10);
    controller.set("balance", balance);

    //this.sendEth(addresses[0], "0xcB9adacAbFa374366377d0D843C7B368500DDbF4", 1);
  },

  actions: {
    sendGreeting: function() {
      console.log("greeting");
      let web3Instance = this.get('web3.web3Instance');
      var gasPrice = 50000000000
      var gas = 500000

      // assumes this contract has been deployed to the blockchain
      var abi = [ { "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "greeting", "type": "string" } ], "name": "greet", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "to", "type": "address" }, { "indexed": false, "name": "owner", "type": "address" }, { "indexed": false, "name": "greeting", "type": "string" } ], "name": "SendGreeting", "type": "event" } ];
      var greeter = web3Instance.eth.contract(abi).at('0xc526dA5A61934DA5f9967865a0a126c4cBc5d11D');
      var greeting = greeter.greet('0xcB9adacAbFa374366377d0D843C7B368500DDbF4', "hey you", {gasPrice: gasPrice, gas: gas}, function(err, txhash) {
        console.log('error: ' + err)
        console.log('txhash: ' + txhash)
      });
      return false;
    }
  },

  sendEth: function(fromAddr, toAddr, valueEth) {
    console.log("send ether");
    var value = parseFloat(valueEth)*1.0e18
    var gasPrice = 50000000000
    var gas = 50000
    this.get('web3.web3Instance').eth.sendTransaction({from: fromAddr, to: toAddr, value: value, gasPrice: gasPrice, gas: gas}, function (err, txhash) {
      console.log('error: ' + err)
      console.log('txhash: ' + txhash)
    })
  }
});
