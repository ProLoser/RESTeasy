/**
 * Checks the haystack array to see if the needle array is contained within it
 */

function contains(haystack, needle) {
  var length = needle.length;
  while (length, length--) {
    if (haystack.indexOf(needle[length]) === -1) {
      return false;
    }
  }
  return true;
}

/**
 * replaces tokens with values
 * @param target {string} string containing colon-prefixed tokens Ex: "some/path/:user/:repo/issues/:id"
 * @param tokens {object literal} hash with keyed tokens and their replacement values
 */

function sprintf(target, tokens) {
  return Object.keys(tokens).reduce(function(ret, key){
    return ret.replace(new RegExp(':' + key, 'g'), tokens[key]);
  }, target);
}


/**
 * PARAMETERS NEEDED:
 * @param targetApi {string} Example: "./linkedin"
 * @param keys {object-literal} a hash containing {login: 'appId', pass: 'appSecret', token: 'optional', token_secret: 'optional' }
 */

 module.exports = function(targetApi, keys, callbackUrl) {

  /**
   * setup oauth
   */

    var url = require('url')
    , http = require('http')
    , path = require('path')
    , querystring = require('querystring')
    , paramAppender = '?'
    , hasParameters = /\/*\?/i
    , map = require(targetApi)
    , resteasy = {};

  if (map.oauth.version === '2.0') {
    var OAuth = require('oauth').OAuth2;
  } else {
    var OAuth = require('oauth').OAuth;  
  };

  function prepSession(request) {
    if (!request.session.resteasy) {
      request.session.resteasy = {};
    }
    if (!request.session.resteasy[targetApi]) {
      request.session.resteasy[targetApi] = {};
    }
  }
  function storeKeys(request) {
    prepSession(request);
    request.session.resteasy[targetApi] = keys;
  }
  function recoverKeys(request) {
    prepSession(request);
    // TODO: use iterator instead
    if (request.session.resteasy[targetApi].oauth_token) {
      keys.oauth_token = request.session.resteasy[targetApi].oauth_token;
      keys.oauth_token_secret = request.session.resteasy[targetApi].oauth_token_secret;
      keys.oauth_authorize_url = request.session.resteasy[targetApi].oauth_authorize_url;
    }
  }

  /**
   * setup oauth client
   */

  var oAuthClient = new OAuth(
    map.hosts.oauth + '/' + map.oauth.request,
    map.hosts.oauth + '/' + map.oauth.access,
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
   * @param callbackUrl {string} the url to hit up to fire resteasy.callback()
   */

  var connect = resteasy.connect = function(request, response) {
    oAuthClient.getOAuthRequestToken({ oauth_callback: callbackUrl }
    , function (error, oauth_token, oauth_token_secret, oauth_authorize_url, additional_parameters) {
      if (error) {
        console.error('[RESTEASY].connect', error);
      } else {
        keys.oauth_token_secret = oauth_token_secret;
        keys.oauth_token = oauth_token;
        keys.oauth_authorize_url = oauth_authorize_url;
        storeKeys(request);
        response.redirect(map.hosts.oauth + '/' + map.oauth.login + '?oauth_token=' + oauth_token);
      }
    });
  };

  /**
   * exchange tokens for access tokens in callback (needs to be modified for OAuth2.0)
   */

  var easycallback = resteasy.callback = function(request, callback) {
    recoverKeys(request);
    var parsed_url = url.parse(request.url, true);
    var protocol = request.socket.encrypted ? 'https' : 'http';
    var callback_url = protocol + '://' + request.headers.host + parsed_url.pathname;
    oAuthClient.getOAuthAccessToken(keys.oauth_token, keys.oauth_token_secret, parsed_url.query.oauth_verifier
    , function (error, oauth_token, oauth_token_secret, additionalParameters) {
      keys.oauth_token = oauth_token;
      keys.oauth_token_secret = oauth_token_secret;
      if (error) {
        callback(error, keys, additionalParameters);
      } else {
        storeKeys(request);
        callback(null, keys, additionalParameters)
      }
    });
  };

  /**
   * REST API Call
   */

  var easyrequest = resteasy.request = function(request, method, path, params, callback) {
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
    
    recoverKeys(request);
        
    // TODO: format should not be hardcoded
    params.format = 'json';
    // Swap out tokens from URI
    path = map.hosts.rest + '/' + sprintf(path, params);
    if (map.prepQuery) {
      path = map.prepQuery(path, params);
    }  
    if (path.match(hasParameters)) {
      paramAppender = "&";
    }
    console.log(path);
    switch (method.toUpperCase()) {
      case 'GET':
        return oAuthClient.get(
          path + paramAppender + querystring.stringify(params),
          keys.oauth_token,
          keys.oauth_token_secret,
          requestCallback(callback)
        );
      case 'POST':
        return oAuthClient.post(
          path,
          keys.oauth_token,
          keys.oauth_token_secret,
          params,
          'application/json; charset=UTF-8',
          requestCallback(callback)
        );
      case 'UPDATE':
        return oAuthClient.put(
          path,
          keys.oauth_token,
          keys.oauth_token_secret,
          params,
          'application/json; charset=UTF-8',
          requestCallback(callback)
        );
      case 'DELETE':
        return oAuthClient.delete(
          path + paramAppender + querystring.stringify(params),
          keys.oauth_token,
          keys.oauth_token_secret,
          requestCallback(callback)
        );
    }
  };

  /**
   * Scan map for the propper path to use
   */

  var scan = resteasy.scan = function(action, section, params) {
    var length = map[action][section].length
      , haystack = Object.keys(params)
      , needle;
    while (length, length--) {
      needle = map[action][section][length].required || [];
      if (contains(haystack, needle)) {
        return params, map[action][section][length];
      }
    }
    console.error('[RESTEASY].scan', 'Map endpoint not found');
  };

  /**
   * Create
   */

  var create = resteasy.create = function(request, section, params, callback) {
    var match;
    match = scan('create', section, params);
    easyrequest(request, 'POST', match.path, params, callback);
  };
  
  /**
   * Read
   */

  var read = resteasy.read = function(request, section, params, callback) {
    var match;
    match = scan('read', section, params);
    easyrequest(request, 'GET', match.path, params, callback);
  };
  
  /**
   * Update
   */

  var update = resteasy.update = function(request, section, params, callback) {
    var match;
    match = scan('update', section, params);
    easyrequest(request, 'PUT', match.path, params, callback);
  };
  
  /**
   * Delete
   */

  var del = resteasy.del = function(request, section, params, callback) {
    var match;
    match = scan('delete', section, params);
    easyrequest(request, 'DELETE', match.path, params, callback);
  };
  
  return resteasy;
};

/* EOF */
