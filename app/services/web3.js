import Ember from 'ember';
const { Service, RSVP: { Promise }, Error } = Ember;

export default Service.extend({
  web3Instance: null,

  getInstance: function(username, host) {
    let hostname = host || "http://localhost:8545";
    if(this.get('web3Instance') === null) {
      let storage = localStorage.getItem(username);
      if(storage !== null) {
        let keystore = new lightwallet.keystore.deserialize(storage);
        this.set("web3Instance", new Web3(this.getProvider(keystore, hostname)));
      } else {
        console.log("Could not find in local storage");
      }
    }
    return this.get('web3Instance');
  },

  register: function(credentials, host) {
    let hostname = host || "http://localhost:8545";

    let self = this;
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
          self.set("web3Instance", new Web3(self.getProvider(ks, hostname)));
          resolve();
        });
      });
    });
  },

  getProvider: function(keystore, host) {
    return new HookedWeb3Provider({
      host: host,
      transaction_signer: keystore
    });
  }
});
