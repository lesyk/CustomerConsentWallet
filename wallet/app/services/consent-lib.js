import Ember from "ember";
import ConsentLib from "npm:consentlib";
const {Service} = Ember;

export default Service.extend({

  web3: null,
  whisper: null,
  consentFlow: null,
  identity: null,
  address: null,

  ttl: 100,
  priority: 100,

  initialize: function (web3) {

    if (!this.get("web3")) {
      let whisper = new ConsentLib.Whisper(web3);
      let consentFlow = new ConsentLib.ConsentFlow(web3, whisper, null);
      let identity = whisper.newIdentity();

      this.set("web3", web3);
      this.set("whisper", whisper);
      this.set("consentFlow", consentFlow);
      this.set("identity", identity);
    }

    return this;
  },

  registerWithIdService: function (email) {
    this.set("email", email);
    this.get("consentFlow").discoverIdentityService((err, result, idServiceAddress) => {
      setTimeout(() => this.get("consentFlow").registerWhisperId(this.get("identity"), idServiceAddress, email, this.get("ttl"), this.get("priority")), 200);
    });
  },

  respondEthAddress: function (address) {
    this.set("address", address);
    this.get("consentFlow").respondEthAddress(this.get("identity"), this.get("email"), address, this.get("ttl"), this.get("priority"));
  },

  getConsentContract: function () {
    return this.get("consentFlow").getConsentContract();
  }
});
