
/**
 * @route /auth/resteasy
 */

var resteasyModule = require('../lib/resteasy')
  , express = require('express')
  , app = express.createServer();

var resteasy = new resteasyModule('./providers/github', { login : '2e9a894eadea867036d6', pass : '64e867859748cf3fc43c1c444f2aa97a3c8d5b6b' }, 'http://localhost:8000/auth/resteasy/callback');

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
  resteasy.retrieveAccessTokens(request, function(error, access_token, access_token_secret) {
    if (error) {
      throw new Error(error);
    } else {
      request.session.access_token = access_token;
      request.session.access_token_secret = access_token_secret;
      response.redirect('/resteasy/me');
    };
  });
});

app.get('/resteasy/me', function(request, response) {
  var params = {
    token: {
      oauth_token_secret: request.session.access_token_secret,
      oauth_token: request.session.resteasy_access_token
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