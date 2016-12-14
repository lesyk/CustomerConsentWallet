import Ember from "ember";
import config from "./config/environment";

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('register');
  this.route('login');
  this.route('mywallet');
  this.route('whisper');
  this.route('identityrequests');
  this.route('log');
});

export default Router;
