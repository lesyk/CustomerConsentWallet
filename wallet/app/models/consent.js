import Ember from 'ember';

export default Ember.Object.extend({

  getState: Ember.computed(function() {
    switch(parseInt(this.get("state"), 10)) {
      case 0:
        return "REQUESTED";
      case 1:
        return "GIVEN";
      case 2:
        return "REVOKED";
      case 3:
        return "REJECTED";
    }
  })
});
