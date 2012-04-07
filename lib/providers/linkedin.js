  
/**
 * A Linkedin API Method Map
 * Refer to the apis plugin for how to build a method map
 * https://github.com/ProLoser/CakePHP-Api-Datasources
 */



 /**
 * Formats an array of fields into the url-friendly nested format cuz linkedin is a pain
 *
 * @param fields {array}
 * @return {string}
 * @link http://developer.linkedin.com/docs/DOC-1014
 */
function fieldSelectors(fields) {
  var result, peices = [];
  if (Object.prototype.toString.call( fields ) === '[object Array]') {
    result = fields.join(',');
  } else if (typeof(fields) === 'string') {
    result = fields;
  } else {
    for (var field in fields) {
      if (fields[field] === true) {
        peices.push(field);
      } else {
        peices.push(field + ':(' + fieldSelectors(fields[field]) + ')');
      }
    }
    result = peices.join(',');
  }
  return result;
}

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
        path : 'people/~'
      },
      {
        path : 'people/url=:url',
        required : [
          'url'
        ]
      },
      {
        path : 'people/id=:id',
        required : [
          'id'
        ]
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
  'prepQuery' : function(query, params) {
    if (params.fields) {
      query += ':(' + fieldSelectors(params.fields) + ')';
    }
    return query;
  }
};

/* EOF */