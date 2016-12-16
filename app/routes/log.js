import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),

  log: [],
  count: 0,
  filter: null,

  setupController: function(controller, model) {
    let web3 = this.get("web3").instance();

    if(filter == null) {
      var that = this;
      var filter = web3.eth.filter({fromBlock: 0, toBlock: 'pending'});
      filter.watch(function(error, result) {
        if (!error) {
          that.get("log").unshift(result);
          controller.set("log", that.get("log"));
          that.set("count", that.get("count") + 1);
          controller.set("count", that.get("count"));
          that.refresh();
        } else {
          console.log(error);
        }
      });
    }
  }
});
