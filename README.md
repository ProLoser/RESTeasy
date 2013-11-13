# RESTeasy
> Make consuming RESTful apis **waaaaay** easier in Node.js

### [New Video Tutorial!](https://vimeo.com/proloser/resteasy)

Ever notice how all of these APIs seem to have a high degree of consistency? They're just a bunch of URLs that accept different parameters you pass to it. So the thing is what's the point of creating a lib for each and every API and endpoint, making each url call involve a different class or method name? This means that in addition to learning the API you have to learn the lib API too. And what happens if the API updates? You're stuck waiting for the lib to incorporate the changes before you can actually leverage the new features.

So with _so much_ repetition from one API to another, I built a way to 'map' APIs. This means that updating and adding new APIs is ridiculously easy, and the only documentation you need to refer to is the native APIs, and even _that_ is kept to a minimum. All methods calls are extremely simple and consistent. Just specify the CRUD action, the resource name and pass the parameters you have available to you. The mapper will figure out what url it needs to use to get the job done, leaving you to make much more versatile code without knowing every nuance of every API.

## Installation

### Step 0: Require (obviously)

```bash
$ npm install resteasy
```

```javascript
var resteasy = require('resteasy');
```

### Step 1: Instantiate

* __First param__ is the name of the provider OR a path to your own provider file.
* __Second param__ is an object containing a `login` key (appId) and a `pass` key (appSecret). You can optionally pass the `oauth_token` and `oauth_token_secret` if you stored it and want to reuse the session

```javascript
// Instantiate an instance with config values
var keys = { login: '[appId]', pass: '[appSecret]' };
//You must pass the full URL to where the callback is located
var callbackUrl = 'url';
// var provider = resteasy('./providers/myprovider', ...); 
var github = resteasy('resteasy/lib/providers/github', keys, callbackUrl);  
```

### Step 2: Authenticate

```
github.connect();
```

...redirects user to API for authentication which then forwards to callbackUrl...

```javascript
// Needs the node.js req object
github.callback(req, function(error, oauth_token, oauth_token_secret, additionalParameters){
  // Store auth credentials
});
```

### Step 3: Querying

You can either use the general-purpose `github.request()` function to build your own queries if you are too lazy to 
supplement a provider, but the preferred method is as follows:

```javascript
var tokens = {
  oauth_token: [your stored token],
  oauth_token_secret: [your stored token secret]
};
github.read(tokens, 'repos', { user: 'ProLoser' },  callback);
```

The syntax is identical for `.create()`, `.update()`, and `.del()`. The provider map will be searched until a path with all
of the REQUIRED params are matched is found. It will then proceed to use that endpoint.

## LinkedIn Notes
http://developer.linkedin.com/documents/profile-api  
You may need to pass fields, to get back the desired data.  
To do this create an object and pass true for every field type you want.  

```javascript
var setFields = {
	'first-name' : true,
	'last-name' : true,
	'positions' : true,
	'educations' : true
};
```

## Expanding Functionality

All it takes to add your own provider is a hashmap containing the specific API's endpoints in an organized manner.

To refer to your provider, just pass the path as the first argument (`github` above) as if you were passing it directly to `require`.

Use this template and check out the other providers for examples:

```javascript
module.exports = {
  // Contains base urls
  hosts : {
    oauth : // Base URL used for all OAuth requests. Ex: 'https://github.com/login/oauth'
    rest : // Base URL used for all API requests. Ex: 'https://api.github.com'
  },
  // OAuth Configuration and paths. Usually appended to hosts.oauth url
  oauth : {
    version : // OAuth version. Ex: '1.0' or '2.0'
    authorize : // Path to 'authorize' endpoint. Ex: A URI of https://github.com/login/oauth/user/authorize would be just 'user/authorize'
    request : // Path to 'requestToken' endpoint
    access : // Path to 'access_token' endpoint 
    login : // Path to 'authenticate' endpoint. Similar to authorize, just auto-redirects
    logout : // Path to 'invalidateToken' endpoint
  },
  // CRUD - Read endpoints
  read : {
    // The 'section' or 'resource' name. Should be identical to the API's resource name
    repos : [
      // An array of endpoints going in order of SMALLER # of required params (or 0 / all optional) to the HIGHEST # of required params
      {
        // Path to endpoint. Can include colon-prefixed tokens that match keys in the params object. Appended to hosts.rest url
        path : 'user/repos',
        // Optional array of REQUIRED params (some endpoints don't need any)
        required : [],
        // Optional array of OPTIONAL (whitelisted) params that are also added to the request and/or substituted as tokens
        optional : [
          'type' // all, owner, public, private, member. Default: all
        ]
      },
      {
        path : 'repos/:user/:repo',
        required : [
          'user',
          'repo'
        ]
        optional : [
          'format',
          'sortBy'
        ]
      }
    ],
    users : [ ... ]
  },
  // CRUD - Write endpoints
  create : { ... },
  // CRUD - Update endpoints
  update: { ... },
  // CRUD - Delete endpoints
  'delete': { ... },
  // An optional callback function to be executed just before any query is fired for API-specific massaging
  prepQuery : function(query) {
    return query;
  },
  // An optional callback function to be executed just before redirecting to connect for auth. Passes a redirectUrl for OAuth v1.0 and a params object for OAuth v2.0
  prepConnect : function([redirectUrl | params], keys, scope) {
    return [redirectUrl | params];
  },
}
```
