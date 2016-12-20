import Ember from 'ember';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  web3: Ember.inject.service(),

  totalCount: 0,
  log: [],

  model() {
    console.log('model')
    let web3 = this.get("web3").instance();

    return RSVP.hash({
      count: web3.eth.getTransactionCount("0x04979CbC97b1902d3E3B57960D40B1fa90a99730"),
      lastBlockNumber: web3.eth.blockNumber,
      lastBlock: web3.eth.getBlock(9596),
      transaction: web3.eth.getTransaction("0xb2899de4e855d25c5592125d066ee1610a82ec8b983e2689b1f14788086a1d7b"),
      log: [],
      totalCount: 0
    });
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    console.log('setupController')

    let web3 = this.get("web3").instance();
    this.set('log', []);
    this.set('totalCount', 0);

    //show all transacitons
    // let countAllTransactions = 0
    // for(let i = 0; i < web3.eth.blockNumber; i++) {
    //     let block = web3.eth.getBlock(i);
    //     if(block.transactions.length != 0) {
    //       console.log(block.transactions);
    //       countAllTransactions += 1;
    //     }
    // }
    // console.log(countAllTransactions);

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
