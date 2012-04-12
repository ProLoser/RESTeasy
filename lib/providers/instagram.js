/**
 * A Flickr API Method Map
 *
 * Refer to the apis plugin for how to build a method map
 * https://github.com/ProLoser/CakePHP-Api-Datasources
 *
 */
module.exports = {
  hosts : {
  	'oauth' : 'https://api.instagram.com/oauth/',
  	'rest' : 'https://api.instagram.com/v1/'
  },
  oauth : {
    'version' : '2.0',
  	// http://www.flickr.com/services/api/auth.howto.web.html
  	'login' : 'authorize',
  	// http://www.flickr.com/services/api/auth.oauth.html
  	'request' : 'request_token',
  	'authorize' : 'authorize',
  	'access' : 'access_token'
  },
  read : {
  	// field
  	'media' : [
  		// api url
  		{
  		  'path' : 'media/popular'
  		},
  		{
  			'path' : 'media/:id',
  			'required' : ['id']
  		},
  		{
  		  'path' : 'media/search',
  			'required' : ['lat', 'lng'],
  			'optional' : ['max_timestamp', 'min_timestamp', 'distance']
  		}
  	],
  },
  write : {
  },
  update : {
  },
  delete : {
  },
  prepConnect : function(redirect, keys, scope) {
    return redirect;
  },
  prepQuery : function(path, params, keys) {
    return path;
  }
};