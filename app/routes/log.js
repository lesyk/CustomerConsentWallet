import Ember from 'ember';

export default Ember.Route.extend({
  log: [],
  count: 0,
  filter: null,

  setupController: function(controller, model) {
    let web3Instance = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    if(filter == null) {
      var that = this;
      var filter = web3Instance.eth.filter({fromBlock: 0, toBlock: 'pending'});
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
