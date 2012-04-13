/**
 * A Flickr API Method Map
 *
 * Refer to the apis plugin for how to build a method map
 * https://github.com/ProLoser/CakePHP-Api-Datasources
 *
 */
module.exports = {
  hosts : {
  	'oauth' : 'http://www.flickr.com/services/oauth/',
  	'rest' : 'http://api.flickr.com/services/rest?nojsoncallback=1&method='
  },
  oauth : {
    'version' : '1.0',
  	// http://www.flickr.com/services/api/auth.howto.web.html
  	'login' : 'authorize',
  	// http://www.flickr.com/services/api/auth.oauth.html
  	'request' : 'request_token',
  	'authorize' : 'authorize',
  	'access' : 'access_token'
  },
  read : {
  	// field
  	'people' : [
  		// api url
  		{
  			'path' : 'flickr.people.getInfo',
  			'required' : ['user_id']
  		},
  		{
  		  'path' : 'flickr.people.findByUsername',
  			'required' : ['username']
  		},
  		{
  		  'path' : 'flickr.people.findByEmail',
  			'required' : ['find_email']
  		},
  		{
  		  'path' : 'flickr.photos.people.getList',
  			'required' : ['photo_id']
  		},
  	],
  	'sets' : [
  		{
  		  'path' : 'flickr.photosets.getInfo',
  			'required' : ['photoset_id'],
  		},
  		{
  		  'path' : 'flickr.photosets.getList',
  			'required' : ['user_id'],
  		},
  		{
  		  'path' : 'flickr.photosets.getContext',
  		  'required' : ['photoset_id', 'photo_id',]
  		},
  	],
  	'photos' : [
  		{
  		  'path' : 'flickr.photos.getNotInSet'
  		},
      {
        'path' : 'flickr.photosets.getPhotos',
  			'required' : ['photoset_id'],
  		},
  	],
  	'comments' : [
  		{
  		  'path' : 'flickr.photos.comments.getList',
  			'required' : ['photo_id'],
  		},
  	],
  },
  write : {
  },
  update : {
  },
  delete : {
  },
  prepConnect : function(redirect, keys, scope) {
    return redirect + '&perms=' + scope;
  },
  prepQuery : function(path, params, keys) {
    params.api_key = keys.login;
    return path;
  }
};