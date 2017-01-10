import Ember from "ember";
import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";
import Consent from "../models/consent";

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),
  consentLib: Ember.inject.service("consentlib"),
  contractService: Ember.inject.service('consent-contract'),
  session: Ember.inject.service('session'),

  beforeModel: function() {
    let web3 = this.get("web3").instance();
    web3.eth.defaultAccount = web3.currentProvider.transaction_signer.getAddresses()[0];
  },

  model: function() {
    let web3 = this.get("web3").instance();
    let contract = this.get("contractService").getConsentContract();
    let customer_address = "0x" + web3.eth.defaultAccount;

    return new Ember.RSVP.Promise((resolve, reject) => {
      contract.customerConsents(customer_address, (error, result) => {
        if(!error) {
          let length = result.toString(10);
          var promises = [];
          for(var i = 0; i < length; i++) {
            let p = new Ember.RSVP.Promise((resolve, reject) => {
              contract.customer_mapping(customer_address, i , (error, result) => {
                if(!error) {
                  contract.getConsent(result.toString(10), (error, result) => {
                    if(!error) {
                      resolve(Consent.create({requester: result[0], customer: result[1], owner: result[2], state: result[3].toString(10), id: result[4]}));
                    } else {
                      reject(error);
                    }
                  });
                } else {
                  reject(error);
                }
              });
            });
            promises.push(p);
          }
          Ember.RSVP.all(promises).then((results) => { resolve(results); });
        } else {
          reject(error);
        }
      });
    });
  },

  setupController: function (controller, model) {
    let web3 = this.get("web3").instance();
    let consentLib = this.get("consentLib").initialize(web3);
    let email = this.get("session").get("data.email");
    let addresses = web3.currentProvider.transaction_signer.getAddresses();
    
    consentLib.registerWithIdService(email);
    consentLib.respondEthAddress(addresses[0]);
    controller.set("email", email);

    controller.set('model', model);
  },

  actions: {
    error(reason) {
      console.error(reason);
      alert("Loading of consents failed: " + reason);
    }
  }
});
