
/**
 * A Linkedin API Method Map
 * Refer to the apis plugin for how to build a method map
 * https://github.com/ProLoser/CakePHP-Api-Datasources
 */

module.exports = {
  hosts : {
    oauth : 'https://api.linkedin.com/uas/oauth',
    rest : 'https://api.linkedin.com/v1'
  },
  // http://developer.linkedin.com/docs/DOC-1251
  oauth : {
    version : '1.0',
    authorize : 'authorize', // Example URI : api.linkedin.com/uas/oauth/authorize
    request : 'requestToken',
    access : 'accessToken',
    login : 'authenticate', // Like authorize, just auto-redirects
    logout : 'invalidateToken'
  },
  read : {
  	// https://developer.linkedin.com/documents/profile-api
    people : [
      {
        path : 'people/id=',
        required : [
          'id'
        ]
      },
      {
        path : 'people/url=',
        required : [
          'url'
        ]
      },
      {
        path : 'people/~'
      }
    ],
    'people-search' : [
      {
        path : 'people-search',
        optional : [
          'keywords',
          'first-name',
          'last-name',
          'company-name',
          'current-company',
          'title',
          'current-title',
          'school-name',
          'current-school',
          'country-code',
          'postal-code',
          'distance',
          'start',
          'count',
          'facet',
          'facets',
          'sort'
        ]
      }
    ]
  },
  write : {
    mailbox : [
      {
        path : 'people/~/mailbox',
        required : [
          'subject',
          'body',
          'recipients'
        ]
      }
    ]
  },
  update : {
  },
  'delete' : {
  },
  'prepQuery' : function(query) {
    return query;
  }
};

/* EOF */