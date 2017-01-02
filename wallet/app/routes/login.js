import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Ember.Route.extend(UnauthenticatedRouteMixin, {
  session: Ember.inject.service('session'),

  actions: {
    login: function() {
      let credentials = this.controller.getProperties('seed', 'password');
      // TODO test that it's a valid seed phrase
      if(credentials.seed === "") {
          this.controller.set("errorMessage", "Seed must be set");
      }
      // TODO password check
      this.get('session').authenticate('authenticator:custom', credentials).catch((reason) => {
        this.controller.set('errorMessage', reason.error || reason);
      });
    },

    generateSeed: function() {
      // TODO set from something random from user
      let extraEntropy = "bla bla bla";
      let seed = lightwallet.keystore.generateRandomSeed(extraEntropy);
      this.controller.set("seed", seed);
      this.controller.set("seedGenerated", true);
    }
  },
});
