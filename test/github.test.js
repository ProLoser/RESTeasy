
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

var resteasy = new resteasyModule('./providers/github', { login : '2e9a894eadea867036d6', pass : '64e867859748cf3fc43c1c444f2aa97a3c8d5b6b' }, 'http://localhost:8000/auth/resteasy/callback');

app.get('/auth/resteasy', function(request, response) {
  resteasy.connect(request, response);
});

app.get('/auth/resteasy/callback', function(request, response) {
  resteasy.callback(request, function(error, keys) {
    if (error) {
      throw new Error(error);
    } else {
      response.redirect('/resteasy/followers');
    };
  });
});

app.get('/resteasy/followers', function(request, response) {
  resteasy.read(request, 'followers', {}, function(error, data) {
    if (error) {
      response.send(error);
    } else {
      response.send(data);
    }
  });
});

app.listen(8000);

/* EOF */