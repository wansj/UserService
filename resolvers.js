import { getPublicKey } from './utils'

const jwt = require('jsonwebtoken')

const resolvers = {
  User: {
    id(obj, args, context, info) {
      return obj._id
    },
    role(obj, args, context, info) {
      return context.models.Role.byId(obj.role)
    }
  },
  Role: {
    id(obj, args, context, info) {
      return obj._id
    }
  },
  Friend: {
    id(obj, args, context, info) {
      return obj._id
    },
    initiator(obj, args, context, info) {
      return context.models.User.byId({id: obj.whose})
    }
  },
  Query: {
    getCaptcha(obj, args, context, info) {
      return context.models.User.getCaptcha(args)
    },
    publicKey(obj, args, context, info) {
      return getPublicKey()
    },
    roles(obj, args, context, info) {
      return context.models.Role.listRoles()
    },
    availableRoles(obj, args, context, info) {
      return context.models.Role.availableRoles()
    },
    users(obj, args, context, info) {
      return context.models.User.listUsers(args)
    },
    user(obj, args, context, info) {
      return context.models.User.byId(args)
    },
    userByName(obj, args, context, info) {
      return context.models.User.byName(args)
    },
    logedUser(obj, args, context, info) {
      return context.models.User.getLogedUser()
    },
    getFriends (obj, args, context, info) {
      return context.models.Friend.getFriends(args, context)
    },
    userByNameOrEmail (obj, args, context, info) {
      return context.models.User.byNameOrEmail(args)
    },
    unHandledFriendship (obj, args, context, info) {
      return context.models.Friend.getUnapprovedFriends()
    }
  },
  Mutation: {
    createRole(obj, args, context, info) {
      return context.models.Role.createRole(args)
    },
    delRole(obj, args, context, info) {
      return context.models.Role.delete(args)
    },
    editRole(obj, args, context, info) {
      return context.models.Role.update(args)
    },
    signUp(obj, args, context, info) {
      return context.models.User.signUp(args)
    },
    delUser(obj, args, context, info) {
      return context.models.User.delete(args)
    },
    editUser(obj, args, context, info) {
      return context.models.User.update(args)
    },
    changePassword(obj, args, context, info) {
      return context.models.User.changePassword(args)
    },
    logIn (obj, args, context, info) {
      return context.models.User.logIn(args)
    },
    logOut(obj, args, context, info) {
      return context.models.User.logOut()
    },
    addFriend (obj, args, context, info) {
      return context.models.Friend.addFriend(args, context)
    },
    approveFriendship (obj, args, context, info) {
      return context.models.Friend.approveFriend(args, context)
    }
    // addFriends (obj, args, context, info) {
    //   return context.models.Friend.addFriends()
    // },
    // createSampleUsers (obj, args, context, info) {
    //   return context.models.User.createSampleUsers()
    // }
  }
}
export default resolvers
