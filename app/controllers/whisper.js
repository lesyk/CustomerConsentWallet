import Ember from "ember";

export default Ember.Controller.extend({

  web3: Ember.inject.service(),

  listening: false,
  topic: null,
  topics: new Map(),
  topicNames: [],
  payload: null,
  messages: [],
  filter: null,
  idServiceAddress: null,

  listenForIdService: function () {

    let self = this;
    let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    web3.shh.filter({
      topics: [web3.fromAscii('identity-service-advertisement')]
    }).watch(function (err, result) {

      let idServiceAdvertisement = JSON.parse(web3.toAscii(result.payload));

      idServiceAdvertisement.topics.forEach(function (topic) {

        let topics = self.get("topics");
        topics.set(topic.topic, topic);

        self.get("topicNames").clear();
        topics.forEach(function (topic) {
          self.get("topicNames").pushObject(topic.topic);
        });

        if (!self.get('topic')) {
          self.set('topic', self.get("topicNames.0"));
        }
      });

      console.log("Identity service at address " + result.from, err, result);
      self.set("idServiceAddress", result.from);
    });
  },

  listen: function () {

    let self = this;
    let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
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

      let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      var identity = web3.shh.newIdentity();

      var message = {
        from: identity,
        to: this.get('idServiceAddress'),
        topics: [web3.fromAscii(topic)],
        payload: web3.fromAscii(payload),
        ttl: 1000,
        priority: 1000
      };

      web3.shh.post(message, function (err, result) {
        console.log("Message post", err, result);
      });
    },

    topicChanged: function (topic) {
      this.set('topic', topic);
      this.set('payload', JSON.stringify(this.get('topics').get(topic).request));
    }
  }
});
