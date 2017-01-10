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
          let consent = Consent.create({
            requester: result[0],
            customer: result[1],
            owner: result[2],
            state: result[3].toString(10),
            id: result[4]
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
              contract.customer_mapping(customer_address, i , (error, result) => {
                if(!error) {
                  contract.getConsent(result.toString(10), consentResultCallback);
                } else {
                  console.log(error);
                }
              });
          }
        } else {
          console.log(error);
        }
    });
  },

  actions: {
    accept: function(consent, i) {
      let web3 = this.get("web3").instance();
      let contract = this.get("contract");
      let controller = this.get("controller");
      let gasPrice = 50000000000;
      let gas = 500000;

      contract.giveConsent(web3.toHex(consent.requester), web3.toHex(consent.owner), web3.toHex(consent.id), {gas: gas, gasPrice: gasPrice}, function(error, result) {
        if(error !== null) {
          console.log(error);
          controller.set("eventError", "Request could not be completed");
        } else {

          let givenEvent = contract.ConsentGiven(function(error, result) {
            if(!error) {
              console.log(result.args);

              // TODO update UI
              // TODO possibly show feedback on when transaction is mined (& has x confirmations)
              if(result.args.given === true) {
                consent.state = 1;
              }
            } else {
              console.log(error);
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
