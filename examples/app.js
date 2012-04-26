var express = require('express')
  , resteasy = require('../resteasy');

var app = express.createServer();

app.use(express.logger('dev'));

// Required by session() middleware
// pass the secret for signed cookies
// (required by session())
app.use(express.cookieParser('keyboard cat'));

// Populates req.session
app.use(express.session({secret:'cat'}));

var easy = resteasy('../providers/github', {
  login: '[YOUR APP ID GOES HERE]',
  pass: '[YOUR APP SECRET GOES HERE]'
}, 'http://localhost:3000/callback');

app.get('/', function(req, res){
  var body = '';
  if (req.session.views) {
    ++req.session.views;
  } else {
    req.session.views = 1;
    body += '<p>First time visiting? view this page in several browsers :)</p>';
  }
  res.send(body + '<p>viewed <strong>' + req.session.views + '</strong> times.</p>');
});

app.get('/connect', function(req, res){
  easy.connect(req, res);
});

app.get('/callback', function(req, res){
  easy.callback(req, function(error, token, token_secret){
    req.session.resteasy = {
      token: token,
      secret: token_secret
    };
    data = error || req.session.resteasy;
    res.send(data);
  });
});

app.get('/repos', function(req, res){
  easy.read({ oauth_token: req.session.resteasy.token, oauth_token_secret: req.session.resteasy.token_secret}, 'repos', { user: 'unfolio', repo: 'RESTeasy' }, function(error, data){
    data = error || data;
    res.send(data);
  })
});

app.listen(3000);
console.log('Express app started on port 3000');