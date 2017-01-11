import Ember from 'ember';

export default Ember.Component.extend({
  web3: Ember.inject.service(),
  contractService: Ember.inject.service('consent-contract'),
  isDone: false,

  rejected: function(errorMsg) {
    console.error(errorMsg);
    alert("Updating consent failed: " + errorMsg);
  },

  actions: {
    acceptConsent: function(consent) {
      let web3 = this.get("web3").instance();
      let contract = this.get("contractService").getConsentContract();
      let gasPrice = 50000000000;
      let gas = 500000;

      return new Ember.RSVP.Promise((resolve, reject) => {
        contract.giveConsent(web3.toHex(consent.requester), web3.toHex(consent.owner), web3.toHex(consent.id), {gas: gas, gasPrice: gasPrice}, (error, result) => {
          if (error !== null) {
            this.rejected(error);
            reject();
          } else {
            let givenEvent = contract.ConsentGiven((error, result) => {
              if (!error) {
                if (result.args.id === consent.id && result.args.given === true) {
                  this.$(".state").text("GIVEN");
                  this.set("isDone", true);
                  resolve();
                } else {
                  this.rejected("Consent could not be given according to contract specification");
                  reject();
                }
              } else {
                this.rejected(error);
                reject();
              }
            });
          }
        });
      });
    },
    rejectConsent: function(id) {
      console.log("reject");
    }
  }
});
