import Ember from 'ember';
import { getProvider } from '../utils/web3-utils';

export default Ember.Route.extend({

  web3: Ember.inject.service(),

  actions: {
    login: function() {
      let credentials = this.controller.getProperties('identification', 'password');
      let storage = localStorage.getItem(credentials.identification);
      if(storage !== null) {
        let keystore = new lightwallet.keystore.deserialize(storage);
        let web3Instance = this.get('web3.web3Instance');
        web3Instance.setProvider(getProvider(keystore));
        this.transitionTo('mywallet', { queryParams: {addresses: keystore.getAddresses()}});
      } else {
        this.controller.set("errorMessage", "Keystore not found. Try to register an account");
        return false;
      }
    }
  }
});
