# RESTeasy

Make consuming RESTful apis __waaaaay__ easier

## Installation

### Step 0: Require (obviously)

```
var resteasy = require('resteasy');
```

### Step 1: Instiante

* __First param__ is the name of the provider OR a path to your own provider file.
* __Second param__ is an object containing a `login` key (appId) and a `pass` key (appSecret). You can optionally pass the `oauth_token` and `oauth_token_secret` if you stored it and want to reuse the session

```
// Instantiate an instance with config values
var github = resteasy('github', keys);
```

### Step 2: Authenticate

You must pass the full URL to where the callback is located

```
github.connect(callbackUrl);
```

...redirects user to API for authentication which then forwards to callbackUrl...

```
github.callback(function(error, tokens){
  // Store auth credentials
});
```

### Step 3: Querying

You can either use the general-purpose `github.request()` function to build your own queries if you are too lazy to 
supplement a provider, but the preferred method is as follows:

```
github.read('repos', { user: 'ProLoser' },  callback);
```

The syntax is identical for `.create()`, `.update()`, and `.del()`. The provider map will be searched until a path with all
of the REQUIRED params are matched is found. It will then proceed to use that endpoint

## Expanding Functionality

All it takes to add your own provider is a hashmap containing the specific API's endpoints in an organized manner.

Use this template and check out the other providers for examples:

```
module.exports = {
  // Contains base urls
  hosts : {
    oauth : // Base URL used for all OAuth requests. Ex: 'https://github.com/login/oauth'
    rest : // Base URL used for all API requests. Ex: 'https://api.github.com'
  },
  // OAuth Configuration and paths
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
        // Path to endpoint. Can include tokens from the params object
        path : 'repos/:user/:repo',
        // Optional array of REQUIRED params (some endpoints don't need any)
        required : [
          'user',
          'repo'
        ]
        // Optional array of OPTIONAL params that are added to the request and/or substituted as tokens
        optional : [
          'format',
          'sortBy'
        ]
      }, 
      {
        path : 'user/repos',
        optional : [
          'type' // all, owner, public, private, member. Default: all
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
}
```