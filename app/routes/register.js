import Ember from 'ember';

export default Ember.Route.extend({
  web3: Ember.inject.service(),

  actions: {
    register: function() {
      var credentials = this.controller.getProperties('identification', 'password');

      var self = this;
      this.get('web3').register(credentials).then(function() {
        self.transitionTo('mywallet', { queryParams: {username: credentials.identification}});
      });
    }
  },
});
