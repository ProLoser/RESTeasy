
/**
 * A Github API Method Map
 * Refer to the apis plugin for how to build a method map
 * https://github.com/ProLoser/CakePHP-Api-Datasources
 */
 
module.exports = {
  "hosts": {
    "oauth" : "github.com/login/oauth",
    "rest" : "api.github.com"
  },
  // http://developer.github.com/v3/oauth/
  "oauth": {
    "version" : "2.0",
    "authorize" : "authorize", // Example URI: https://github.com/login/oauth/authorize
    "request" : "requestToken", //client_id={$this->config["login"]}&redirect_uri
    "access" : "access_token", 
    "login" : "authenticate", // Like authorize, just auto-redirects
    "logout" : "invalidateToken"
  },
  "read": {
    // field
    "repos" : [
      {
        "path" : "repos/:user/:repo",
        "required" : [
          "user",
          "repo"
        ]
      },
      // api url
      {
        "path" : "users/:user/repos",
        // required conditions
        "required" : [
          "user"
        ],
        // optional conditions the api call can take
        "optional" : [
          "type" // all, owner, member. Default: public
        ]
      }, {
        "path" : "orgs/:org/repos",
        // required conditions
        "required" : [
          "org"
        ],
        // optional conditions the api call can take
        "optional" : [
          "repo" // all, public, member. Default: all
        ]
      }, {
        "path" : "repos/search",
        "required" : [
          "seach"
        ],
        "optional" : [
          "start_page",
          "language"
        ]
      }, {
        "path" : "user/repos",
        "optional" : [
          "type" // all, owner, public, private, member. Default: all
        ]
      }
    ],
    "followers" : [],
    "followings" : [],
    "friends" : [],
    "bookmarks" : [],
    "issues" : [
      {
        "path" : "issues/search",
        "required": [
          "owner",
          "repo",
          "state",
          "search"
        ]
      }, {
        "path" : "issues/show",
        "required" : [
          "owner",
          "repo",
          "number"
        ]
      }, {
        "path" : "issues",
        "required" : [
          "owner",
          "repo",
          "state"
        ]
      },
    ],
    "comments" : [
      {
        "path" : "issues/comments",
        "required" : [
          "owner",
          "repo",
          "number" // id of issue
        ]
      }
    ],
    "comment" : [ // singular for reading single comment
      {
        "path" : "issues/comments",
        "required" : [
          "owner",
          "repo",
          "number" // id of comment
        ]
      }
    ],
    "commits" : [
      {
        "path" : "repos/:user/:repo/commits",
        "required" : [
          "user",
          "repo",
        ],
        "optional" : [
          "sha",
          "path"
        ]
      }
    ]
  },
  "create": {
    "repos" : {
      {
        "path" : "repos/fork",
        "required" : [
          "owner",
          "repo"
        ]
      }, {
        "path" : "user/repos",
        "required" : [
          "name"
        ]
        "optional" : [
          "description",
          "homepage",
          "private",
          "has_issues", // boolean
          "has_wiki", // boolean
          "has_downloads", // boolean
          "team_id" // number
        ]
      }
    },
    "issues" : {
      {
        "path" : "repos/:user/:repo/issues",
        "required" : [
          "user",
          "repo",
          "title"
        ],
        "optional" : [
          "body",
          "assignee", // string
          "milestone", // number
          "labels" // array of strings
        ]
      }
    },
    "comments" : {
      {
        "path" : "repos/:user/:repo/issues/:id/comments",
        "required" : [
          "user",
          "repo",
          "id",
          "body" // content of comment
        ]
      }
    }
  },
  "update": {
    "repos" : [
      {
        "path" : "repos/set/private",
        "required" : [
          "private",
          "owner",
          "repo"
        ]
      }, {
        "path" : "repos/set/public",
        "required" : [
          "public",
          "owner",
          "repo"
        ]
      }
    ],
    "issues" : [
       {
        "path": "repos/:user/:repo/issues/:id",
        "required" : [
          "user",
          "repo",
          "id", // issue id
        ],
        "optional" : [
          "title",
          "body",
          "assignee",
          "state",
          "milestone", // number
          "labels" // array of strings
        ]
      }
    ]
  },
  "delete": {
    "repos" : [
      {
        "path" : "repos/delete",
        "requried" : [
          "owner",
          "repo",
        ],
        "optional" : [
          "delete_token"
        ]
      }
    ]
  },
  "prepQuery" : function(query) {
    return query;
  },
}