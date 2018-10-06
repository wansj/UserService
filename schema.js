const { gql } = require('apollo-server-micro')
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    password: String!
    role: Role
    department: String!
    loged: Boolean
    avatar: String
    email: String
    pinyin: String
  }
  type Role {
    id: ID!
    name: String!
    description: String
    isAdmin: Boolean!
    maxBorrowDuration: Int!
    maxHoldCount: Int!
    maxDelayTimes: Int!
    maxDelayDays: Int!
  }
  type AuthPayload {
    token: String
    user: User
  }
  type GroupedFriends{
    group: String
    friends: [User]
  }
  type Friend{
    id: ID
    whose: String
    initiator: User
    friend: String
    state: String
    validateMessage: String
  }
  enum FriendShipStatus{
    None
    Unapproved
    Approved
  }
  type AddFriendPayload{
    friend: User
    status: FriendShipStatus
  }
  type Query {
    roles: [Role!]
    availableRoles: [Role!]
    users(skip: Int, limit: Int): [User!]
    user(id: ID!): User
    userByName(username: String!): User
    userByNameOrEmail(search: String!): AddFriendPayload
    logedUser: User
    publicKey: String
    getCaptcha(email: String!): String
    getFriends(skip: Int!, limit: Int!): [GroupedFriends]
    unHandledFriendship: [Friend]
  }
  type Mutation {
    createRole(name: String!, description: String, isAdmin: Boolean!, maxBorrowDuration: Int!, maxHoldCount: Int!, maxDelayTimes: Int!, maxDelayDays: Int!): Role
    delRole(id: ID!): Boolean
    editRole(id: ID!, name: String, description: String, isAdmin: Boolean, maxBorrowDuration: Int, maxHoldCount: Int, maxDelayTimes: Int, maxDelayDays: Int): Role
    signUp(username: String!, password: String!, department: String!, role: ID!, email: String!, avatar: String): AuthPayload
    delUser(userId: ID!): Boolean
    editUser(userId: ID!, username: String, password: String, department: String, role: ID, email: String, avatar: String): User
    changePassword(email: String!, password: String!): User
    logIn(username: String!, password: String!): AuthPayload
    logOut: Boolean
    addFriend(friend: ID!, validateMessage: String!): Friend
    approveFriendship(id: ID): Friend
  }
`
export default typeDefs
