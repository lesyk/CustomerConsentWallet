import Ember from "ember";
import Base from "ember-simple-auth/authenticators/base";

export default Base.extend({
  web3: Ember.inject.service("web3"),
  session: Ember.inject.service('session'),

  restore(data) {
    let web3 = this.get("web3").instance();
    return new Ember.RSVP.Promise(function (resolve, reject) {
      if(web3 != null) {
        resolve();
      } else {
        reject();
      }
    });
  },

  authenticate(credentials) {
    this.get('session').set('data.email', credentials.email);
    return this.get("web3").create(credentials.seed, credentials.password);
  },

  invalidate(data) {
    this.get('web3').delete();
    return Promise.resolve();
  }
});
