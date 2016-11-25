import Ember from 'ember';

export default Ember.Route.extend({
  web3: Ember.inject.service(),

  actions: {
    register: function() {
      var credentials = this.controller.getProperties('identification', 'password');

      var self = this;
      this.registerAccount(credentials).then(function(provider) {
        let web3Instance = self.get('web3.web3Instance');
        web3Instance.setProvider(provider);
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
          if (err) throw err;

          ks.generateNewAddress(pwDerivedKey, 5);
          var addr = ks.getAddresses();

          ks.passwordProvider = function (callback) {
            var pw = prompt("Please enter password", "Password");
            callback(null, pw);
          };

          var provider = new HookedWeb3Provider({
            host: "http://localhost:8545",
            transaction_signer: ks
          });

          resolve(provider);
        });
      });
    });
  }
});
