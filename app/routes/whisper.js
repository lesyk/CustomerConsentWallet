import Ember from "ember";

export default Ember.Route.extend({

  web3: Ember.inject.service(),

  setupController: function () {
    let web3 = this.get('web3.web3Instance');

    var filter = web3.shh.filter({
      // topics: [web3.fromAscii(topic)]
    });

    var self = this;

    filter.watch(function (err, result) {
      console.log("Message received", err, result, web3.toAscii(result.payload));
      self.controller.get("messages").pushObject(web3.toAscii(result.payload));
    });
  }
});
