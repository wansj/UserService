import mongoose from 'mongoose'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { getUser, wrapError } from './utils'

const { AuthenticationError } = require("apollo-server-errors")
const pubsub = new RedisPubSub()

const FriendSchema = mongoose.Schema({
  whose: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  friend: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  state: {
    type: String,
    default: 'Unapproved',
    enum: ['Unapproved', 'Approved']
  },
  validateMessage: {
    type: String,
    required: true
  }
})
FriendSchema.index({whose: 1, friend: 1})
let Friend = null
try {
  Friend = mongoose.model('Friend', FriendSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Friend = mongoose.model('Friend')
  }
}

const generateFriendModel = (token) => ({
  // addFriends: () => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       if (!token) throw new AuthenticationError('用户未登陆')
  //       const logedUser = await getUser(token)
  //       const data = []
  //       for (let i=130;i<156; i++) {
  //         data.push({
  //           whose: logedUser.id,
  //           friend: `5b91e4377b03c708775e27${i.toString(16)}`,
  //           state: 'Approved'
  //         })
  //       }
  //       Friend.insertMany(data,function (err, res) {
  //         if (err) reject(err)
  //         else resolve(true)
  //       })
  //     } catch (e) {
  //       reject(wrapError(e))
  //     }
  //   })
  // },
  addFriend: ({friend, validateMessage}, context) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const logedUser = await getUser(token)
        const data = { friend, validateMessage, whose: logedUser._id}
        const doc = await new Friend(data).save()
        const initiator = await context.models.User.byId({id: doc.whose})
        pubsub.publish('friendAdded', {friendAdded: {...doc.toObject(), initiator, id: doc._id}})
        resolve(doc)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  approveFriend: ({id}, context) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const doc = await Friend.findByIdAndUpdate(id, {state: 'Approved'}, {new: true}).exec()
        const initiator = await context.models.User.byId({id: doc.whose})
        pubsub.publish('friendApproved', {friendApproved: {...doc.toObject(), initiator, id: doc._id}})
        resolve(doc)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  getUnapprovedFriends: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const logedUser = await getUser(token)
        if (!logedUser) throw new AuthenticationError('用户未登陆')
        const friends = await Friend.find({
          state: 'Unapproved',
          friend: logedUser._id
        }).exec()
        resolve(friends)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  getFriends ({skip, limit}, context) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const logedUser = await getUser(token)
        // others代表别人加我好友，mine代表我主动加别人好友
        const result = await Friend.aggregate().facet({
          others: [
            {
              $match: {state: 'Approved', friend: logedUser._id}
            },
            {
              $lookup: {
                from: 'users',
                localField: 'whose',
                foreignField: '_id',
                as: 'user'
              }
            }
          ],
          mine: [
            {
              $match: {state: 'Approved', whose: logedUser._id}
            },
            {
              $lookup: {
                from: 'users',
                localField: 'friend',
                foreignField: '_id',
                as: 'user'
              }
            }
          ]
        }).project({
          users: {
            $concatArrays: ['$mine', '$others']
          }
        }).unwind('users').group({
          _id: {
            $toUpper: {
              $substr: [{
                $arrayElemAt: ['$users.user.pinyin', 0]
              }, 0, 1]
            }
          },
          friends: {
            $push: {$arrayElemAt: ['$users.user', 0]}
          }
        }).project({
          _id: 0,
          group: '$_id',
          friends: 1
        }).sort('group').skip(skip).limit(limit).exec()
        resolve(result)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  }
})
module.exports = { Friend, generateFriendModel }