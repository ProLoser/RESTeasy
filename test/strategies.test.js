
/**
 * @route /auth/resteasy
 */

var resteasyModule = require('../lib/resteasy')
  , express = require('express')
  , app = express.createServer();

var resteasy = new resteasyModule('./providers/linkedin', { login : '63nm998t88y8', pass : 'H2kdiM0muQ3KNX0G' }, 'http://localhost:8000/auth/resteasy/callback');

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret : 'SECRET!:P',
    maxAge : new Date(Date.now() + 86400000),
  }));
});

app.get('/auth/resteasy', function(request, response) {
  resteasy.connect(request, response);
});

app.get('/auth/resteasy/callback', function(request, response) {
  resteasy.retrieveAndSaveAccessTokens(request, function(error, access_token, access_token_secret) {
    if (error) {
      throw new Error(error);
    } else {
      console.log('connected to linkedin');
      console.log('access_token:', access_token);
      console.log('access_token_secret:', access_token_secret);
      response.redirect('/resteasy/me');
    };
  });
});

app.get('/resteasy/me', function(request, response) {
  var params = {
    token: {
      oauth_token_secret: request.session.user.resteasy_access_token_secret,
      oauth_token: request.session.user.resteasy_access_token
    }
  };
  resteasy.request('GET', '/people/~', params, function(error, data, _response) {
    if (error) {
      console.error(error);
      return;
    } else {
      response.send(data);
    }
  });
});

app.listen(8000);

/* EOF */