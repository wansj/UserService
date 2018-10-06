import "regenerator-runtime/runtime"
import typeDefs from './schema'
import resolvers from './resolvers'
import db from './db'
import { User, generateUserModel } from './User'
import { Role, generateRoleModel } from './Role'
import { Friend, generateFriendModel } from './Friend'

const { router, get, post, options } = require('microrouter')
const { ApolloServer } = require('apollo-server-micro')
const cors = require('micro-cors')()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const Authorization = req.headers.authorization || ''
    // console.log(req.headers)
    const token = Authorization.replace('Bearer ', '')
    return {
      models: {
        User: generateUserModel(token),
        Role: generateRoleModel(token),
        Friend: generateFriendModel(token)
      }
    }
  }
})
const graphqlPath = '/graphqlUser'
const graphqlHandler = cors(server.createHandler({ path: graphqlPath }))

module.exports = router(
  get('/', (req, res) => 'Welcome!'),
  options(graphqlPath, graphqlHandler),
  post(graphqlPath, graphqlHandler),
  get(graphqlPath, graphqlHandler)
)
