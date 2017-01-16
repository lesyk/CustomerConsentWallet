import Ember from "ember";
import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";
import Consent from "../models/consent";

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),
  consentLib: Ember.inject.service("consent-lib"),
  session: Ember.inject.service('session'),
  consentRequestEvent: null,
  consentIds: [],

  beforeModel: function() {
    let web3 = this.get("web3").instance();
    web3.eth.defaultAccount = web3.currentProvider.transaction_signer.getAddresses()[0];
  },

  model: function() {
    let web3 = this.get("web3").instance();
    let contract = this.get("consentLib").initialize(web3).getConsentContract();
    let customer_address = "0x" + web3.eth.defaultAccount;

    return new Ember.RSVP.Promise((resolve, reject) => {
      contract.customerConsents(customer_address, (error, result) => {
        if (!error) {
          let length = result.toString(10);
          var promises = [];
          for (var i = 0; i < length; i++) {
            let p = new Ember.RSVP.Promise((resolve, reject) => {
              contract.customer_mapping(customer_address, i, (error, result) => {
                if (!error) {
                  contract.getConsent(result.toString(10), (error, result) => {
                    if (!error) {
                      resolve(Consent.create({
                        requester: result[0],
                        customer: result[1],
                        owner: result[2],
                        state: result[3].toString(10),
                        id: result[4].toString(10)
                      }));
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
          Ember.RSVP.all(promises).then((results) => {
            this.set("consentIds", results.map((obj) => {
              return obj.id;
            }));
            resolve(results);
          });
        } else {
          reject(error);
        }
      });
    });
  },

  resetController: function(controller, isExiting, transition) {
    if (isExiting) {
      this.get("consentRequestEvent").stopWatching();
    }
  },

  setupController: function(controller, model) {
    this._super(controller, model);

    let web3 = this.get("web3").instance();
    let consentLib = this.get("consentLib").initialize(web3);
    let email = this.get("session").get("data.email");
    let addresses = web3.currentProvider.transaction_signer.getAddresses();
    let address = "0x" + addresses[0];
    let contract = this.get("consentLib").initialize(web3).getConsentContract();

    consentLib.registerWithIdService(email);
    consentLib.respondEthAddress(address);
    controller.set("email", email);

    let event = contract.ConsentRequested();
    event.watch((error, result) => {
      if (result.args.customer === address) {
        console.log("Got consent request");        
        let consent = Consent.create({
          requester: result.args.data_requester,
          customer: result.args.customer,
          owner: result.args.data_owner,
          state: 0,
          id: result.args.id.toString(10)
        });
        if (!this.get("consentIds").includes(consent.id)) {
          model.pushObject(consent);
          controller.set('model', model);
          this.get("consentIds").push(consent.id);
        }
      }
    });
    this.set('consentRequestEvent', event);
  },

  actions: {
    error(reason) {
      console.error(reason);
      alert("Loading of consents failed: " + reason);
    }
  }
});
