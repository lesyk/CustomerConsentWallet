import Ember from 'ember';

export default Ember.Route.extend({
  web3: Ember.inject.service(),

  queryParams: {
    addresses: {}
  },

  model: function(params) {
    return params.addresses.split(",");
  },

  setupController: function(controller, model) {
    let web3Instance = this.get('web3.web3Instance');
    var account = model[0];
    var balance = web3Instance.eth.getBalance(account).toString(10);
    controller.set("balance", balance);
    controller.set("addresses", model);
  }
});
