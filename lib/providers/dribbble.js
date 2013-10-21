
/**
 * A Github API Method Map
 * Refer to the apis plugin for how to build a method map
 * https://github.com/ProLoser/CakePHP-Api-Datasources
 */
 
module.exports = {
  hosts : {
    rest : 'http://api.dribbble.com/'
  },
  read : {
    shots: [
      {
        path: 'shots/:id',
        required: ['id']
      },
      {
        path: 'shots/:id/rebounds',
        required: ['id', 'rebounds']
      },
      {
        path: 'shots/:list',
        required: ['list']
      },
      {
        path: 'players/:player/shots',
        required: ['player']
      },
      {
        path: 'players/:player/shots/following',
        required: ['player','following']
      },
      {
        path: 'players/:player/shots/likes',
        required: ['player','likes']
      }
    ],
    players: [
      {
        path: 'players/:id',
        required: ['id']
      },
      {
        path: 'players/:id/followers',
        required: ['id', 'followers']
      },
      {
        path: 'players/:id/following',
        required: ['id', 'following']
      },
      {
        path: 'players/:id/draftees',
        required: ['id', 'draftees']
      }
    ],
    comments: [
      {
        path: 'shots/:id/comments',
        required: ['id']
      }
    ]
  }
}