//var env = require('./env.json');
var env = {
  "development": {
    "allowed": [
      "http://localhost:8244",
      "http://mancala.vladionescu.com"
    ]
  }
};

module.exports = function() {
  var node_env = 'development';
  return env[node_env];
};
