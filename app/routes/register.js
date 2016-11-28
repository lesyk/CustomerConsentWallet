import Ember from 'ember';
import { getProvider } from '../utils/web3-utils';

export default Ember.Route.extend({
  web3: Ember.inject.service(),

  actions: {
    register: function() {
      var credentials = this.controller.getProperties('identification', 'password');

      var self = this;
      this.registerAccount(credentials).then(function(keystore) {
        let web3Instance = self.get('web3.web3Instance');
        let provider = getProvider(keystore);
        web3Instance.setProvider(getProvider(keystore));
        self.transitionTo('mywallet', { queryParams: {addresses: provider.transaction_signer.getAddresses()}});
      });
    }
  },

  registerAccount: function(credentials) {

    var self = this;

    return new Promise(function(resolve, reject) {
      lightwallet.keystore.createVault({
        password: credentials.password,
        // seedPhrase: seedPhrase, // Optionally provide a 12-word seed phrase
        // salt: fixture.salt,     // Optionally provide a salt.
                                   // A unique salt will be generated otherwise.
        // hdPathString: hdPath    // Optional custom HD Path String
      }, function (err, ks) {

        ks.keyFromPassword(credentials.password, function (err, pwDerivedKey) {
          if (err) {
            throw err;
          }

          ks.generateNewAddress(pwDerivedKey, 5);

          ks.passwordProvider = function (callback) {
            var pw = prompt("Please enter password", "Password");
            callback(null, pw);
          };

          localStorage.setItem(credentials.identification, ks.serialize());
          resolve(ks);
        });
      });
    });
  }
});
