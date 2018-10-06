'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n  type User {\n    id: ID!\n    username: String!\n    password: String!\n    role: Role\n    department: String!\n    loged: Boolean\n    avatar: String\n    email: String\n    pinyin: String\n  }\n  type Role {\n    id: ID!\n    name: String!\n    description: String\n    isAdmin: Boolean!\n    maxBorrowDuration: Int!\n    maxHoldCount: Int!\n    maxDelayTimes: Int!\n    maxDelayDays: Int!\n  }\n  type AuthPayload {\n    token: String\n    user: User\n  }\n  type GroupedFriends{\n    group: String\n    friends: [User]\n  }\n  type Friend{\n    id: ID\n    whose: String\n    initiator: User\n    friend: String\n    state: String\n    validateMessage: String\n  }\n  enum FriendShipStatus{\n    None\n    Unapproved\n    Approved\n  }\n  type AddFriendPayload{\n    friend: User\n    status: FriendShipStatus\n  }\n  type Query {\n    roles: [Role!]\n    availableRoles: [Role!]\n    users(skip: Int, limit: Int): [User!]\n    user(id: ID!): User\n    userByName(username: String!): User\n    userByNameOrEmail(search: String!): AddFriendPayload\n    logedUser: User\n    publicKey: String\n    getCaptcha(email: String!): String\n    getFriends(skip: Int!, limit: Int!): [GroupedFriends]\n    unHandledFriendship: [Friend]\n  }\n  type Mutation {\n    createRole(name: String!, description: String, isAdmin: Boolean!, maxBorrowDuration: Int!, maxHoldCount: Int!, maxDelayTimes: Int!, maxDelayDays: Int!): Role\n    delRole(id: ID!): Boolean\n    editRole(id: ID!, name: String, description: String, isAdmin: Boolean, maxBorrowDuration: Int, maxHoldCount: Int, maxDelayTimes: Int, maxDelayDays: Int): Role\n    signUp(username: String!, password: String!, department: String!, role: ID!, email: String!, avatar: String): AuthPayload\n    delUser(userId: ID!): Boolean\n    editUser(userId: ID!, username: String, password: String, department: String, role: ID, email: String, avatar: String): User\n    changePassword(email: String!, password: String!): User\n    logIn(username: String!, password: String!): AuthPayload\n    logOut: Boolean\n    addFriend(friend: ID!, validateMessage: String!): Friend\n    approveFriendship(id: ID): Friend\n  }\n'], ['\n  type User {\n    id: ID!\n    username: String!\n    password: String!\n    role: Role\n    department: String!\n    loged: Boolean\n    avatar: String\n    email: String\n    pinyin: String\n  }\n  type Role {\n    id: ID!\n    name: String!\n    description: String\n    isAdmin: Boolean!\n    maxBorrowDuration: Int!\n    maxHoldCount: Int!\n    maxDelayTimes: Int!\n    maxDelayDays: Int!\n  }\n  type AuthPayload {\n    token: String\n    user: User\n  }\n  type GroupedFriends{\n    group: String\n    friends: [User]\n  }\n  type Friend{\n    id: ID\n    whose: String\n    initiator: User\n    friend: String\n    state: String\n    validateMessage: String\n  }\n  enum FriendShipStatus{\n    None\n    Unapproved\n    Approved\n  }\n  type AddFriendPayload{\n    friend: User\n    status: FriendShipStatus\n  }\n  type Query {\n    roles: [Role!]\n    availableRoles: [Role!]\n    users(skip: Int, limit: Int): [User!]\n    user(id: ID!): User\n    userByName(username: String!): User\n    userByNameOrEmail(search: String!): AddFriendPayload\n    logedUser: User\n    publicKey: String\n    getCaptcha(email: String!): String\n    getFriends(skip: Int!, limit: Int!): [GroupedFriends]\n    unHandledFriendship: [Friend]\n  }\n  type Mutation {\n    createRole(name: String!, description: String, isAdmin: Boolean!, maxBorrowDuration: Int!, maxHoldCount: Int!, maxDelayTimes: Int!, maxDelayDays: Int!): Role\n    delRole(id: ID!): Boolean\n    editRole(id: ID!, name: String, description: String, isAdmin: Boolean, maxBorrowDuration: Int, maxHoldCount: Int, maxDelayTimes: Int, maxDelayDays: Int): Role\n    signUp(username: String!, password: String!, department: String!, role: ID!, email: String!, avatar: String): AuthPayload\n    delUser(userId: ID!): Boolean\n    editUser(userId: ID!, username: String, password: String, department: String, role: ID, email: String, avatar: String): User\n    changePassword(email: String!, password: String!): User\n    logIn(username: String!, password: String!): AuthPayload\n    logOut: Boolean\n    addFriend(friend: ID!, validateMessage: String!): Friend\n    approveFriendship(id: ID): Friend\n  }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _require = require('apollo-server-micro'),
    gql = _require.gql;

var typeDefs = gql(_templateObject);
exports.default = typeDefs;
//# sourceMappingURL=schema.js.map