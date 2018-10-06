'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

var jwt = require('jsonwebtoken');

var resolvers = {
  User: {
    id: function id(obj, args, context, info) {
      return obj._id;
    },
    role: function role(obj, args, context, info) {
      return context.models.Role.byId(obj.role);
    }
  },
  Role: {
    id: function id(obj, args, context, info) {
      return obj._id;
    }
  },
  Friend: {
    id: function id(obj, args, context, info) {
      return obj._id;
    },
    initiator: function initiator(obj, args, context, info) {
      return context.models.User.byId({ id: obj.whose });
    }
  },
  Query: {
    getCaptcha: function getCaptcha(obj, args, context, info) {
      return context.models.User.getCaptcha(args);
    },
    publicKey: function publicKey(obj, args, context, info) {
      return (0, _utils.getPublicKey)();
    },
    roles: function roles(obj, args, context, info) {
      return context.models.Role.listRoles();
    },
    availableRoles: function availableRoles(obj, args, context, info) {
      return context.models.Role.availableRoles();
    },
    users: function users(obj, args, context, info) {
      return context.models.User.listUsers(args);
    },
    user: function user(obj, args, context, info) {
      return context.models.User.byId(args);
    },
    userByName: function userByName(obj, args, context, info) {
      return context.models.User.byName(args);
    },
    logedUser: function logedUser(obj, args, context, info) {
      return context.models.User.getLogedUser();
    },
    getFriends: function getFriends(obj, args, context, info) {
      return context.models.Friend.getFriends(args, context);
    },
    userByNameOrEmail: function userByNameOrEmail(obj, args, context, info) {
      return context.models.User.byNameOrEmail(args);
    },
    unHandledFriendship: function unHandledFriendship(obj, args, context, info) {
      return context.models.Friend.getUnapprovedFriends();
    }
  },
  Mutation: {
    createRole: function createRole(obj, args, context, info) {
      return context.models.Role.createRole(args);
    },
    delRole: function delRole(obj, args, context, info) {
      return context.models.Role.delete(args);
    },
    editRole: function editRole(obj, args, context, info) {
      return context.models.Role.update(args);
    },
    signUp: function signUp(obj, args, context, info) {
      return context.models.User.signUp(args);
    },
    delUser: function delUser(obj, args, context, info) {
      return context.models.User.delete(args);
    },
    editUser: function editUser(obj, args, context, info) {
      return context.models.User.update(args);
    },
    changePassword: function changePassword(obj, args, context, info) {
      return context.models.User.changePassword(args);
    },
    logIn: function logIn(obj, args, context, info) {
      return context.models.User.logIn(args);
    },
    logOut: function logOut(obj, args, context, info) {
      return context.models.User.logOut();
    },
    addFriend: function addFriend(obj, args, context, info) {
      return context.models.Friend.addFriend(args, context);
    },
    approveFriendship: function approveFriendship(obj, args, context, info) {
      return context.models.Friend.approveFriend(args, context);
    }
    // addFriends (obj, args, context, info) {
    //   return context.models.Friend.addFriends()
    // },
    // createSampleUsers (obj, args, context, info) {
    //   return context.models.User.createSampleUsers()
    // }

  }
};
exports.default = resolvers;
//# sourceMappingURL=resolvers.js.map