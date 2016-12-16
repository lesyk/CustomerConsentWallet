import Ember from 'ember';
const { Service, RSVP: { Promise }, Error } = Ember;

export default Service.extend({
  web3: null,
  storageKey: "wallet",

  instance: function(host) {

    let hostname = host || "http://localhost:8545";
    if(this.get('web3') === null) {
      let storage = localStorage.getItem(this.get("storageKey"));
      if(storage !== null) {
        let keystore = new lightwallet.keystore.deserialize(storage);
        this.set("web3", new Web3(this.getProvider(keystore, hostname)));
      } else {
        console.log("wallet not set in local storage");
        return null;
      }
    }
    return this.get('web3');
  },

  create: function(seedPhrase, password, host) {
    let hostname = host || "http://localhost:8545";

    let self = this;
    return new Promise(function(resolve, reject) {
      lightwallet.keystore.createVault({
        password: password,
        seedPhrase: seedPhrase
      }, function (err, ks) {

        ks.keyFromPassword(password, function (err, pwDerivedKey) {
          if (err) {
            throw err;
          }

          ks.generateNewAddress(pwDerivedKey, 5);

          ks.passwordProvider = function (callback) {
            var pw = prompt("Please enter password", "Password");
            callback(null, pw);
          };

          localStorage.setItem(self.get("storageKey"), ks.serialize());
          self.set("web3", new Web3(self.getProvider(ks, hostname)));
          resolve();
        });
      });
    });
  },

  delete: function() {
    localStorage.removeItem(this.get("storageKey"));
  },

  getProvider: function(keystore, host) {
    return new HookedWeb3Provider({
      host: host,
      transaction_signer: keystore
    });
  }
});
