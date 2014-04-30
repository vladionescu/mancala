App.ApplicationController = Ember.Controller.extend({
	needs: 'login',
	username: Ember.computed.alias('controllers.login.username'),

	actions: {
	        logout: function() {
                        // clear the saved username and effectively log the user out
                        this.set('username', null);
                        localStorage.removeItem('username');
               
                        // redirect to the login screen
                        this.transitionTo('login');
                }
	}
});
