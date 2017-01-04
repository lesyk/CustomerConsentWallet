import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),

  setupController: function(controller, model) {
    let web3 = this.get("web3").instance();

    let addresses = web3.currentProvider.transaction_signer.getAddresses();
    controller.set("addresses", addresses);

    let addressesAndBalances = [];
    for(let i = 0; i < addresses.length; i++){
      web3.eth.defaultAccount = addresses[i];
      let balance = web3.eth.getBalance(addresses[i]).toString(10);
      addressesAndBalances.push({'address': addresses[i], 'balance': balance});
    }
    
    controller.set('addressesAndBalances', addressesAndBalances);
  }
});
