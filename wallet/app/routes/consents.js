import Ember from "ember";
import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";
import Consent from "../models/consent";

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),
  consentLib: Ember.inject.service("consent-lib"),
  session: Ember.inject.service('session'),

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
                        id: result[4]
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
            let consentMap = results.reduce(function(map, obj) {
              map[obj.id] = obj;
              return map;
            }, {});
            resolve(consentMap);
          });
        } else {
          reject(error);
        }
      });
    });
  },

  setupController: function(controller, model) {
    let web3 = this.get("web3").instance();
    let consentLib = this.get("consentLib").initialize(web3);
    let email = this.get("session").get("data.email");
    let addresses = web3.currentProvider.transaction_signer.getAddresses();
    let address = "0x" + addresses[0];
    let contract = this.get("consentLib").initialize(web3).getConsentContract();

    consentLib.registerWithIdService(email);
    consentLib.respondEthAddress(address);
    controller.set("email", email);

    contract.ConsentRequested((error, result) => {
      if (result.args.customer === address) {
        console.log("Got consent request");
        let consent = Consent.create({
          requester: result.args.data_requester,
          customer: result.args.customer,
          owner: result.args.data_owner,
          state: 0,
          id: result.args.id
        });
        model[consent.id] = consent;
        controller.set('model', model);
      }
    });

    controller.set('model', model);
  },

  actions: {
    error(reason) {
      console.error(reason);
      alert("Loading of consents failed: " + reason);
    }
  }
});
