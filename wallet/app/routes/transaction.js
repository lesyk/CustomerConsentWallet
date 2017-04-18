import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),

  model: function (params) {
    let web3 = this.get("web3").instance();

    return Ember.RSVP.hash({
      transaction: web3.eth.getTransaction(params.id)
    });
  },

});
