import Ember from "ember";

export default Ember.Controller.extend({
  web3: Ember.inject.service(),

  listening: false,
  topic: null,
  payload: null,
  messages: [],
  filter: null,

  listen: function () {

    let self = this;
    let web3 = this.get("web3").instance();
    let filter = web3.shh.filter({
      topics: [web3.fromAscii(this.get('topic'))]
    }).watch(function (err, result) {
      console.log("Message received", err, result, web3.toAscii(result.payload));
      self.get("messages").pushObject(web3.toAscii(result.payload));
    });

    this.set('messages', []);
    this.set('filter', filter);
  }.observes('topic'),

  actions: {
    whisper: function () {

      var topic = this.get('topic');
      var payload = this.get('payload');

      let web3 = this.get("web3").instance();
      var identity = web3.shh.newIdentity();

      var message = {
        from: identity,
        topics: [web3.fromAscii(topic)],
        payload: web3.fromAscii(payload),
        ttl: 1000,
        priority: 1000
      };

      web3.shh.post(message, function (err, result) {
        console.log("Message post", err, result);
      });
    }
  }
});
