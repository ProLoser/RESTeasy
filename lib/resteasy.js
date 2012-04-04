
/**
 * Checks the haystack array to see if the needle array is contained within it
 */

function match(haystack, needle) {
  needle.filter(function(n) {
    if (haystack.indexOf(n) == -1)
      return false;
    return true;
  });
}

/**
 * replaces tokens with values
 * @param target {string} string containing colon-prefixed tokens Ex: "some/path/:user/:repo/issues/:id"
 * @param tokens {object literal} hash with keyed tokens and their replacement values
 */

function sprintf(target, tokens) {
  return Object.keys(tokens).reduce(function(ret, key){
    return ret.replace(new RegExp(':'+key, "g"), tokens[key]);
  }, target);
}

/**
 * PARAMETERS NEEDED:
 * @param targetApi {string} Example: "./linkedin"
 * @param keys {object-literal} a hash containing {login: 'appId', pass: 'appSecret', token: 'optional', token_secret: 'optional' }
 * @param callbackUrl {string} the url to hit up to fire resteasy.callback()
 */

 module.exports = function(targetApi, keys, callbackUrl) {

  /**
   * OAuth
   */

  var OAuth = require('oauth').OAuth
    , url = require('url')
    , http = require('http')
    , path = require('path')
    , querystring = require('querystring')
    , paramAppender = '?'
    , hasParameters = /\/*\?/i
    , map = require(targetApi)
    , resteasy = {};

  /**
   * setup oauth client
   */

  var oAuthClient = new OAuth(
    map.hosts.oauth + map.oauth.request,
    map.hosts.oauth + map.oauth.access,
    keys.login,
    keys.pass,
    map.oauth.version,
    callbackUrl,
    'HMAC-SHA1',
    null, 
    {'Accept': '*/*', 'Connection': 'close'}
  );

  /**
   * connect to api
   */

  var connect = resteasy.connect = function(request, response) {
    oAuthClient.getOAuthRequestToken({oauth_callback: callbackUrl }
    , function (error, oauth_token, oauth_token_secret, oauth_authorize_url, additional_parameters) {
      if (error) {
        console.error(error);
      } else {
        request.session.redirect_url = request.url;
        request.session.oauth_token_secret = keys.oauth_token_secret = oauth_token_secret;
        request.session.oauth_token = keys.oauth_token = oauth_token;
        response.redirect(map.hosts.oauth + map.oauth.login + '?oauth_token=' + oauth_token);
      }
    });
  };

  /**
   * exchange tokens for access tokens in callback (needs to be modified for OAuth2.0)
   */

  var callback = resteasy.callback = function(request, callback) {
    var parsed_url = url.parse(request.url, true);
    var protocol = request.socket.encrypted ? 'https' : 'http';
    var callback_url = protocol + '://' + request.headers.host + parsed_url.pathname;
    oAuthClient.getOAuthAccessToken(request.session.oauth_token, request.session.oauth_token_secret, parsed_url.query.oauth_verifier
    , function (error, oauth_token, oauth_token_secret, additionalParameters) {
      if (error) {
        callback(error, oauth_token, oauth_token_secret, additionalParameters);
      } else {
        keys.oauth_token = oauth_token;
        keys.oauth_token_secret = oauth_token_secret;
        callback(null, oauth_token, oauth_token_secret, additionalParameters)
      }
    });
  };

  /**
   * REST API Call
   */

  var request = resteasy.request = function(method, path, params, callback) {
    function requestCallback(callback) {
      return function (error, data, response) {
        if (error) {
          callback(error, null);
        } else {
          try {
            callback(null, JSON.parse(data));
          } catch (exc) {
            callback(exc, null);
          }
        }
      };
    }
    if (method.toUpperCase() === 'GET') {
      params.format = 'json';  
      if (path.match(hasParameters)) {
        paramAppender = "&";
      }
      return oAuthClient.get(
        map.hosts.rest + path + paramAppender + querystring.stringify(params),
        keys.oauth_token,
        keys.oauth_token_secret,
        requestCallback(callback)
      );
    } else if (method.toUpperCase() === 'POST') {
      return oAuthClient.post(
        map.hosts.rest + path,
        keys.oauth_token,
        keys.oauth_token_secret,
        params,
        'application/json; charset=UTF-8',
        requestCallback(callback)
      );
    }
  };

  /**
   * Scan map for the propper path to use
   */

  var scan = resteasy.scan = function(action, section, params) {
    var length = map[action][section].length;
    while (length, length--) {
      if (match(params, map[action][section][length].required)) {
        return params, map[action][section][length];
      }
    }
  };

  /**
   * Create
   */

  var create = resteasy.create = function(section, params, callback) {
    var match, path;
    match = scan('create', section, params);
    path = sprintf(match.path, params);
    request('POST', path, params, callback);
  };
  
  /**
   * Read
   */

  var read = resteasy.read = function(section, params, callback) {
    var match, path;
    match = scan('read', section, params);
    path = sprintf(match.path, params);
    request('GET', path, params, callback);
  };
  
  /**
   * Update
   */

  var update = resteasy.update = function(section, params, callback) {
    var match, path;
    match = scan('update', section, params);
    path = sprintf(match.path, params);
    request('PUT', path, params, callback);
  };
  
  /**
   * Delete
   */

  var del = resteasy.del = function(section, params, callback) {
    var match, path;
    match = scan('delete', section, params);
    path = sprintf(match.path, params);
    request('DELETE', path, params, callback);
  };
  
  return resteasy;
};

/* EOF */