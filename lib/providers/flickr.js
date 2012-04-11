/**
 * A Flickr API Method Map
 *
 * Refer to the apis plugin for how to build a method map
 * https://github.com/ProLoser/CakePHP-Api-Datasources
 *
 */
module.exports = {
  hosts : {
  	'oauth' : 'http://www.flickr.com/services/oauth',
  	'rest' : 'http://api.flickr.com/services/rest'
  },
  oauth : {
  	'scheme' : 'http',
  	// http://www.flickr.com/services/api/auth.howto.web.html
  	'login' : '?api_key=:login&perms=:permissions&api_sig=:token',
  	// http://www.flickr.com/services/api/auth.oauth.html
  	'request' : 'request_token',
  	'authorize' : 'authorize',
  	'access' : 'access_token'
  },
  read : {
  	// field
  	'people' : {
  		// api url
  		'flickr.people.getInfo' : {
  			// required conditions
  			'required' : ['user_id']
  		},
  		'flickr.people.findByUsername' : {
  			'required' : ['username']
  		},
  		'flickr.people.findByEmail' : {
  			'required' : ['find_email']
  		},
  		'flickr.photos.people.getList' : {
  			'required' : ['photo_id']
  		},
  	},
  	'sets' : {
  		'flickr.photosets.getInfo' : {
  			'required' : ['photoset_id'],
  		},
  		'flickr.photosets.getList' : {
  			'required' : ['user_id'],
  		},
  		'flickr.photosets.getContext' : {
  		  'required' : [
    			'photoset_id',
    			'photo_id',
  			]
  		},
  	},
  	'photos' : {
  		'flickr.photosets.getPhotos' : {
  			'required' : ['photoset_id'],
  		},
  		'flickr.photos.getNotInSet' : {
  		},
  	},
  	'comments' : {
  		'flickr.photos.comments.getList' : {
  			'required' : ['photo_id'],
  		},
  	},
  },
  write : {
  },
  update : {
  },
  delete : {
  }
};