import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),
  contractService: Ember.inject.service('consent-contract'),
  contract: null,
  contractEvents: [],

  setupController: function(controller, model) {
    let web3 = this.get("web3").instance();
    let addresses = web3.currentProvider.transaction_signer.getAddresses();
    
    this.set("contract", this.get("contractService").getConsentContract());

    this.fetchContractEvents(this.get("contract"), "0x" + addresses[0]);
  },

  fetchContractEvents: function(contract, customer_address) {

    // TODO filter out consent requests that has already been accepted or rejected
    var contractEvents = contract.ConsentRequested({}, {fromBlock: 0, toBlock: 'latest'});
    contractEvents.watch( (error, event) => {
      if (!error) {
        console.log(event);
        if(event.args.customer == customer_address) {
          this.get("contractEvents").push(event);
          this.get('controller').set("contractEvents", this.get("contractEvents"));
        }
      } else {
        console.log(error);
      }
    });
  },

  actions: {
    accept: function(event) {
      let web3 = this.get("web3").instance();
      let contract = this.get("contract");
      let controller = this.get("controller");
      let gasPrice = 50000000000;
      let gas = 500000;
      contract.giveConsent(event.args.data_requester, event.args.data_owner, event.args.id, {gas: gas, gasPrice: gasPrice}, function(error, result) {
        if(error !== null) {
          console.log(error);
          controller.set("eventError", "Request could not be completed");
        } else {
          console.log(result);
          controller.set("eventError", "");
          web3.eth.getTransaction(result, function(error, result) {
            if(error !== null) {
              console.log(error);
              controller.set("eventError", "Request could not be completed");
            } else {
              console.log("Got transaction");
              console.log(result);
            }
          });
        }
      });
    },
    reject: function(id) {
      console.log("reject");
    }
  }
});
