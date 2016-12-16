import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),

  beforeModel: function() {
    if(this.get("session").get("isAuthenticated") !== true) {      
      this.transitionTo('login');
    }
  }
});
