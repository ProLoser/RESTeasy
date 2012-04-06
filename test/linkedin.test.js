
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

var resteasy = new resteasyModule('./providers/linkedin', { login : '63nm998t88y8', pass : 'H2kdiM0muQ3KNX0G' }, 'http://localhost:8000/auth/resteasy/callback');

app.get('/auth/resteasy', function(request, response) {
  resteasy.connect(request, response);
});

app.get('/auth/resteasy/callback', function(request, response) {
  resteasy.callback(request, function(error, linkedin_oauth_access, linkedin_oauth_access_secret) {
    if (error) {
      throw new Error(error);
    } else {
      request.session.linkedin_oauth_access = linkedin_oauth_access;
      request.session.linkedin_oauth_access_secret = linkedin_oauth_access_secret;
      response.redirect('/resteasy/me');
    };
  });
});

app.get('/resteasy/me', function(request, response) {
  var tokens = {
    oauth_token : request.session.linkedin_oauth_access,
    oauth_token_secret : request.session.linkedin_oauth_access_secret 
  };
  resteasy.read(tokens, 'people', {}, function(error, data) {
    if (error) {
      response.send(error);
    } else {
      response.send(data);
    }
  });
});

app.listen(8000);

/* EOF */