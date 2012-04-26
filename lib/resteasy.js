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
 * Escape all string values in the object
 */
function escape(params) {
  for (var key in params) {
    if (typeof(params[key]) == 'string') {
      params[key] = encodeURIComponent(params[key]);
    }
  }
  return params;
}

/**
 * Decodes JSON and JSONP
 */
function requestCallback(callback) {
  return function (error, data, response) {
    if (error) {
      callback(error, data, response);
    } else {
      if (typeof data == "string") {
        try {
          callback(error, JSON.parse(data), response);
        } catch (e) {
          callback(error, data, response);
        }
      } else {
        callback(error, JSON.parse(JSON.stringify(data)), response);
      }
    }
  };
}

/**
 * PARAMETERS NEEDED:
 * @param targetApi {string} Example: "./linkedin"
 * @param keys {object-literal} a hash containing the following (can optionally be initialized with tokens already present):
      login: 'applicationId'
      pass: 'applicationSecret'
      [token]: 'optional'
      [token_secret]: 'optional'
 * @param callbackUrl {string} usually needs to match the callback url configured on the application on the provider side
 * @param [scope] {string} optional
 */

 module.exports = function(targetApi, keys, callbackUrl, scope) {
   
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
    , resteasy = {}
    , OAuth
    , oAuthClient;

  if (map.oauth.version === '2.0') {
    // OAuth 2.0
    OAuth = require('oauth').OAuth2;
    oAuthClient = new OAuth(
      keys.login,
      keys.pass,
      map.hosts.oauth,
      map.oauth.authorize,
      map.oauth.access
    );
  } else {
    // OAuth 1.0
    OAuth = require('oauth').OAuth; 
    oAuthClient = new OAuth(
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
  }

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
    for (var token in request.session.resteasy[targetApi]) {
      keys[token] = request.session.resteasy[targetApi][token];
    }
  };

  /**
   * Connect to API by redirecting to their server
   * 
   * @param request {object} reference to the express request object
   * @param response {object} reference to the express response object
   */
  var connect = resteasy.connect = function(request, response) {
    if (map.oauth.version === '2.0') {
      var params = { redirect_uri : callbackUrl, response_type: 'code' };
      if (scope) {
        params.scope = scope;
      }
      if (map.prepConnect) {
        params = map.prepConnect(params, keys, scope);
      }
      var redirectUrl = oAuthClient.getAuthorizeUrl(params);
      response.redirect(redirectUrl);
    } else {
      oAuthClient.getOAuthRequestToken({ oauth_callback: callbackUrl }
      , function (error, oauth_token, oauth_token_secret, oauth_authorize_url, additional_parameters) {
        if (error) {
          console.error('[RESTEASY].connect', error);
        } else {
          keys.oauth_token_secret = oauth_token_secret;
          keys.oauth_token = oauth_token;
          keys.oauth_authorize_url = oauth_authorize_url;
          storeKeys(request);
          var redirect = map.hosts.oauth + map.oauth.login + '?oauth_token=' + oauth_token;
          if (map.prepConnect) {
            redirect = map.prepConnect(redirect, keys, scope);
          }
          response.redirect(redirect);
        }
      });
    }
  };

  /**
   * After returning from API redirect, store the authentication credentials
   * 
   * @param request {object} reference to the express request object
   * @param callback {function(error, oauth_token, oauth_token_secret)} callback function where you store the authentication credentials
   */
  var easycallback = resteasy.callback = function(request, callback) {
    recoverKeys(request);
    var parsed_url = url.parse(request.url, true);
    var protocol = request.socket.encrypted ? 'https' : 'http';
    var callback_url = protocol + '://' + request.headers.host + parsed_url.pathname;
    if (map.oauth.version === '2.0') {
        oAuthClient.getOAuthAccessToken(parsed_url.query.code
          , { redirect_uri: callbackUrl, response_type: 'token', grant_type: 'authorization_code' }
          , function( error, access_token, refresh_token ){
            if ( error ) {
              console.error('[RESTEASY].connect', error);
              callback(error);
            } else {
              keys.access_token = keys.oauth_token = access_token;
              if ( refresh_token ) {
                keys.refresh_token = keys.oauth_token_secret = refresh_token;
              }
              storeKeys(request);
              callback(null, access_token, refresh_token);
            }
          });
    } else {
      oAuthClient.getOAuthAccessToken(keys.oauth_token, keys.oauth_token_secret, parsed_url.query.oauth_verifier
      , function (error, oauth_token, oauth_token_secret, additionalParameters) {
        keys.oauth_token = oauth_token;
        keys.oauth_token_secret = oauth_token_secret;
        if (error) {
          console.error('[RESTEASY].connect', error);
          callback(error, null, null, additionalParameters);
        } else {
          storeKeys(request);
          callback(null, oauth_token, oauth_token_secret, additionalParameters);
        }
      });
    }
  };

  /**
   * REST API Call
   *
   * @param tokens {object-literal} Hash that should contain: 
   *    oauth_token
   *    oauth_token_secret
   * @param method {string} HTTP method. Values: ( GET | PUT | POST | DELETE )
   * @param path {string} the url to be appended to the host.rest url
   * @param callback {function(error, data)} callback function
   */
  var easyrequest = resteasy.request = function(tokens, method, path, params, callback) {
    var method = method.toUpperCase();
    // TODO: format should not be hardcoded
    params.format = 'json';
    
    // Escape values
    if (method === 'GET' || method === 'DELETE') {
      params = escape(params);
    }

    // Swap out tokens from URI
    path = map.hosts.rest + sprintf(path, params);
    if (map.prepQuery) {
      path = map.prepQuery(path, params, keys);
    }  
    if (path.match(hasParameters)) {
      paramAppender = "&";
    }
    // console.log('[RESTEASY].request', path + paramAppender + querystring.stringify(params));
    
    if (map.oauth.version === '2.0') {
      // parameters: _request(method, url, headers, post_body, access_token, callback);
      if (method === 'GET' || method === 'DELETE') {
        oAuthClient._request(
          method,
          path + paramAppender + querystring.stringify(params),
          {},
          '',
          tokens.oauth_token,
          requestCallback(callback)
        );
      } else {
        oAuthClient._request(
          method,
          path,
          {},
          querystring.stringify( params ),
          tokens.oauth_token,
          requestCallback(callback)
        );
      }
    } else {
      switch (method) {
        case 'GET':
          return oAuthClient.get(
            path + paramAppender + querystring.stringify(params),
            tokens.oauth_token,
            tokens.oauth_token_secret,
            requestCallback(callback)
          );
        case 'POST':
          return oAuthClient.post(
            path,
            tokens.oauth_token,
            tokens.oauth_token_secret,
            params,
            'application/json; charset=UTF-8',
            requestCallback(callback)
          );
        case 'UPDATE':
          return oAuthClient.put(
            path,
            tokens.oauth_token,
            tokens.oauth_token_secret,
            params,
            'application/json; charset=UTF-8',
            requestCallback(callback)
          );
        case 'DELETE':
          return oAuthClient.delete(
            path + paramAppender + querystring.stringify(params),
            tokens.oauth_token,
            tokens.oauth_token_secret,
            requestCallback(callback)
          );
      }
    }
  };

  /**
   * Scan map for the propper path to use
   *
   * @param action {string} The CRUD action being performed (read|write|update|delete)
   * @param section {string} The name of the resource block to refer to inside the provider map (Ex: 'repos')
   * @param params {object-literal} The parameters to use for searching the map (checks required only)
   */
  var scan = resteasy.scan = function(action, section, params) {
    var length = map[action][section].length
      , haystack = Object.keys(params)
      , needle;
    while (length, length--) {
      needle = map[action][section][length].required || [];
      if (contains(haystack, needle)) {
        return map[action][section][length];
      }
    }
    console.error('[RESTEASY].scan', 'Map endpoint not found');
  };

  /**
   * Create
   *
   * @param tokens {object-literal} Should contain 'oauth_token' key and 'oauth_token_secret' key
   * @param section {string} The name of the resource block to refer to inside the provider map (Ex: 'repos')
   * @param params {object-literal} The parameters to use for searching the map (checks required only)
   * @param callback {function(error, data)} callback function
   */
  var create = resteasy.create = function(tokens, section, params, callback) {
    var match;
    match = scan('create', section, params);
    easyrequest(tokens, 'POST', match.path, params, callback);
  };
  
  /**
   * Read
   *
   * @param tokens {object-literal} Hash that should contain: 
   *    oauth_token
   *    oauth_token_secret
   * @param section {string} The name of the resource block to refer to inside the provider map (Ex: 'repos')
   * @param params {object-literal} The parameters to use for searching the map (checks required only)
   * @param callback {function(error, data)} callback function
   */
  var read = resteasy.read = function(tokens, section, params, callback) {
    var match;
    match = scan('read', section, params);
    easyrequest(tokens, 'GET', match.path, params, callback);
  };
  
  /**
   * Update
   *
   * @param tokens {object-literal} Hash that should contain: 
   *    oauth_token
   *    oauth_token_secret
   * @param section {string} The name of the resource block to refer to inside the provider map (Ex: 'repos')
   * @param params {object-literal} The parameters to use for searching the map (checks required only)
   * @param callback {function(error, data)} callback function
   */
  var update = resteasy.update = function(tokens, section, params, callback) {
    var match;
    match = scan('update', section, params);
    easyrequest(tokens, 'PUT', match.path, params, callback);
  };
  
  /**
   * Delete
   *
   * @param tokens {object-literal} Hash that should contain: 
   *    oauth_token
   *    oauth_token_secret
   * @param section {string} The name of the resource block to refer to inside the provider map (Ex: 'repos')
   * @param params {object-literal} The parameters to use for searching the map (checks required only)
   * @param callback {function(error, data)} callback function
   */
  var del = resteasy.del = function(tokens, section, params, callback) {
    var match;
    match = scan('delete', section, params);
    easyrequest(tokens, 'DELETE', match.path, params, callback);
  };
  
  return resteasy;
};

/* EOF */
