
/**
 * @route /auth/resteasy
 */

var resteasyModule = require('../lib/resteasy')
  , express = require('express')
  , app = express.createServer();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret : 'SECRET',
    maxAge : new Date(Date.now() + 86400000),
  }));
});

var resteasy = new resteasyModule('./providers/github', { login : '728139c3a2d13a537cd9', pass : '6d29f8b32792dc0151f068acd52267b705fb437c' }, 'http://localhost:8000/auth/resteasy/callback');

app.get('/auth/resteasy', function(request, response) {
  resteasy.connect(request, response);
});

app.get('/auth/resteasy/callback', function(request, response) {
  resteasy.callback(request, function(error, github_oauth_access, github_oauth_access_secret) {
    if (error) {
      throw new Error(error);
    } else {
      request.session.github_oauth_access = github_oauth_access;
      request.session.github_oauth_access_secret = github_oauth_access_secret;
      response.redirect('/resteasy/my');
    };
  });
});

app.get('/resteasy/my', function(request, response) {
  var tokens = {
    oauth_token : request.session.github_oauth_access,
    oauth_token_secret : request.session.github_oauth_access_secret 
  };
  resteasy.read(tokens, 'repos', {}, function(error, data) {
    if (error) {
      response.send(error);
    } else {
      response.send(data);
    }
  });
});

app.listen(8000);

/* EOF */