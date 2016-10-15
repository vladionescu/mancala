// Create an instance of Ember. This starts Ember.
// From here on out we will refer to our Ember application as 'App'.
window.App = Ember.Application.create();

// create a socket service that can be accessed from any controller or route
var SocketService = Ember.Object.extend({
  socket: null,
  connect: function() {
	// connect to the backend server
	var socket = io.connect('http://mancala.vladionescu.com:8244');

	// set the socket
        this.set('socket', socket);
  }
});
 
 
App.initializer({
  name: 'socket',
  initialize: function(container) {
    container.register('service:socket', SocketService);

    container.injection('controller', 'socket', 'service:socket');
    container.injection('route', 'socket', 'service:socket');
  }
});
