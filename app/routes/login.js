import Ember from 'ember';

export default Ember.Route.extend({

  web3: Ember.inject.service(),

  actions: {
    login: function() {
      let credentials = this.controller.getProperties('identification', 'password');
      let web3Provider = this.get('web3').getInstance(credentials.identification);
      if(web3Provider !== null) {
        this.transitionTo('mywallet', { queryParams: {username: credentials.identification}});
      } else {
        this.controller.set("errorMessage", "Keystore not found. Try to register an account");
      }
      return false;
    }
  }
});
