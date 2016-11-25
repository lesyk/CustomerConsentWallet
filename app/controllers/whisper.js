import Ember from 'ember';

export default Ember.Controller.extend({

  web3: Ember.inject.service(),

  topic: null,
  payload: null,
  messages: [],

  actions: {
    whisper: function () {

      var topic = this.get('topic');
      var payload = this.get('payload');

      let web3 = this.get('web3.web3Instance');
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
