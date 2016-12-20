import Ember from 'ember';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),

  totalCount: 0,
  log: [],

  setupController: function(controller, model) {
    this._super(controller, model);
    console.log('setupController')

    let web3 = this.get("web3").instance();
    this.set('log', []);
    this.set('totalCount', 0);

    //show all transacitons except: from account -> ember generated;
    let filter = web3.eth.filter({fromBlock:0, toBlock: 'pending'});
    filter.watch( (error, result) => {
      if (!error) {
        console.log('watch executed');
        this.get("log").unshift(result);
        controller.set("log", this.get("log"));
        this.set("totalCount", this.get("totalCount") + 1);
        controller.set("totalCount", this.get("totalCount"));
      } else {
        console.error(error);
      }
    });
  }
});
