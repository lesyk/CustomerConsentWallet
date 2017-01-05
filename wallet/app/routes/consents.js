import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Consent from '../models/consent';
import ethJSABI from "npm:ethereumjs-abi";

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),
  contractService: Ember.inject.service('consent-contract'),
  contract: null,
  contractEvents: [],
  consents: [],

  setupController: function(controller, model) {
    let web3 = this.get("web3").instance();
    let addresses = web3.currentProvider.transaction_signer.getAddresses();
    web3.eth.defaultAccount = addresses[0];

    this.set("contract", this.get("contractService").getConsentContract());
    this.fetchConsents(this.get("contract"), "0x" + addresses[0]);
  },

  fetchConsents: function(contract, customer_address) {
    let web3 = this.get("web3").instance();

    let consentResultCallback = (error, result) => {
        if(!error) {
          // TODO result should be decoded
          let consent = Consent.create({
            id: result[0].toString(10),
            requester: result[1],
            customer: result[2],
            owner: result[3],
            state: result[4].toString(10)
          });
          this.get("consents").push(consent);
          this.get("controller").set("consents", this.get("consents"));
        } else {
          console.log(error);
        }
    };

    contract.customerConsents(customer_address, (error, result) => {
        if(!error) {
          let length = result.toString(10);
          for(var i = 0; i < length; i++) {
              contract.consents(i, consentResultCallback);
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
      console.log(event.args.data_requester);
      contract.giveConsent(event.args.data_requester, event.args.data_owner, event.args.id, {gas: gas, gasPrice: gasPrice}, function(error, result) {
        if(error !== null) {
          console.log(error);
          controller.set("eventError", "Request could not be completed");
        } else {
          controller.set("eventError", "");
          // web3.eth.getTransaction(result, function(error, result) {
          //   if(error !== null) {
          //     console.log(error);
          //     controller.set("eventError", "Request could not be completed");
          //   } else {
          //     console.log("Got transaction");
          //     console.log(result);
          //   }
          // });
        }
      });
    },
    reject: function(id) {
      console.log("reject");
    }
  }
});
