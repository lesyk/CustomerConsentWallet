import Ember from 'ember';

export default Ember.Component.extend({
  web3: Ember.inject.service(),
  contractService: Ember.inject.service('consent-contract'),

  actions: {
    accept: function(consent) {
      let web3 = this.get("web3").instance();
      let contract = this.get("contractService").getConsentContract();
      let gasPrice = 50000000000;
      let gas = 500000;

      return new Ember.RSVP.Promise((resolve, reject) => {

        contract.giveConsent(web3.toHex(consent.requester), web3.toHex(consent.owner), web3.toHex(consent.id), {gas: gas, gasPrice: gasPrice}, (error, result) => {
          if(error !== null) {
            reject(error);
          } else {
            let givenEvent = contract.ConsentGiven(function(error, result) {
              if(!error) {
                console.log(result.args);

                // TODO update UI
                if(result.args.given === true) {
                  consent.state = 1;
                  resolve();
                } else {
                  reject();
                }
              } else {
                console.log(error);
                reject();
              }
            });
          }
        });
      });
    },
    reject: function(id) {
      console.log("reject");
    }
  }

});
