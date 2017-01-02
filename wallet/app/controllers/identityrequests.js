import Ember from "ember";

export default Ember.Controller.extend({

  web3: Ember.inject.service(),

  requestFilter: null,
  identityRequests: [],

  listen: function () {

    let self = this;
    let web3 = this.get('web3').instance();

    if (!this.get('requestFilter')) {
      let localIdentityRequests = JSON.parse(localStorage.getItem('identityRequests'));
      let identityRequests = self.get('identityRequests');

      if (localIdentityRequests) {
        identityRequests.pushObjects(localIdentityRequests);
      }

      let requestFilter = web3.shh.filter({
        topics: [web3.fromAscii('identity-request-broadcast')]
      }).watch(function (err, result) {
        result.payload = web3.toAscii(result.payload);
        result.sent = new Date(result.sent * 1000);

        if (!identityRequests.isAny('hash', result.hash)) {
          result.accepted = false;
          result.ignored = false;
          identityRequests.pushObject(result);
          localStorage.setItem('identityRequests', JSON.stringify(identityRequests));
        }
      });

      this.set('requestFilter', requestFilter);
    }
  },

  actions: {
    ignore: function (request) {
      Ember.set(request, 'ignored', true);
      localStorage.setItem('identityRequests', JSON.stringify(this.get('identityRequests')));
    },

    accept: function (request) {

      let self = this;
      let web3 = this.get('web3.web3Instance');
      var identity = web3.shh.newIdentity();

      var message = {
        from: identity,
        to: request.from,
        topics: [web3.fromAscii('identity-response-broadcast')],
        payload: web3.fromAscii(identity),
        ttl: 1000,
        priority: 100
      };

      web3.shh.post(message, function (err, result) {
        if (result) {
          Ember.set(request, 'accepted', true);
          localStorage.setItem('identityRequests', JSON.stringify(self.get('identityRequests')));
        }
      });
    }
  }
});
