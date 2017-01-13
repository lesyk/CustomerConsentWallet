import Ember from 'ember';

export default Ember.Component.extend({
  web3: Ember.inject.service(),
  consentLib: Ember.inject.service('consent-lib'),

  rejected: function(errorMsg) {
    console.error(errorMsg);
    alert("Updating consent failed: " + errorMsg);
  },

  actions: {
    acceptConsent: function(consent) {
      let web3 = this.get("web3").instance();
      let contract = this.get("consentLib").initialize(web3).getConsentContract();
      let gasPrice = 50000000000;
      let gas = 500000;
      let state = 1;
      let stateText = "GIVEN";

      return new Ember.RSVP.Promise((resolve, reject) => {
        contract.updateConsent(web3.toHex(consent.requester), web3.toHex(consent.owner), web3.toHex(consent.id), state, {gas: gas, gasPrice: gasPrice}, (error, result) => {
          if (error !== null) {
            this.rejected(error);
            reject();
          } else {
            let event = contract.ConsentUpdated();
            event.watch((error, result) => {
              if (!error) {
                if (result.args.id === consent.id && result.args.state.toString(10) === state.toString()) {
                  if (result.args.updated === true) {
                    this.$(".state").text(stateText);
                    this.$(".acceptConsent").hide();
                    this.$(".rejectConsent").hide();
                    resolve();
                  } else {
                    this.rejected("Consent could not be updated according to contract specification");
                    reject();
                  }
                }
                // else wait for event for this consent
              } else {
                this.rejected(error);
                reject();
              }
              event.stopWatching();
            });
          }
        });
      });
    },
    rejectConsent: function(consent) {
      let web3 = this.get("web3").instance();
      let contract = this.get("consentLib").initialize(web3).getConsentContract();
      let gasPrice = 50000000000;
      let gas = 500000;
      let state = 3;
      let stateText = "REJECTED";

      return new Ember.RSVP.Promise((resolve, reject) => {
        contract.updateConsent(web3.toHex(consent.requester), web3.toHex(consent.owner), web3.toHex(consent.id), state, {gas: gas, gasPrice: gasPrice}, (error, result) => {
          if (error !== null) {
            this.rejected(error);
            reject();
          } else {
            let event = contract.ConsentUpdated();
            event.watch((error, result) => {
              if (!error) {
                if (result.args.id === consent.id && result.args.state.toString(10) === state.toString()) {
                  if (result.args.updated === true) {
                    this.$(".state").text(stateText);
                    this.$(".acceptConsent").hide();
                    this.$(".rejectConsent").hide();
                    resolve();
                  } else {
                    this.rejected("Consent could not be updated according to contract specification");
                    reject();
                  }
                }
                // else wait for event for this consent
              } else {
                this.rejected(error);
                reject();
              }
            });
          }
          event.stopWatching();
        });
      });
    }
  }
});
