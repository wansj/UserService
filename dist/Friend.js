'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _graphqlRedisSubscriptions = require('graphql-redis-subscriptions');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("apollo-server-errors"),
    AuthenticationError = _require.AuthenticationError;

var pubsub = new _graphqlRedisSubscriptions.RedisPubSub();

var FriendSchema = _mongoose2.default.Schema({
  whose: {
    type: _mongoose2.default.Schema.Types.ObjectId,
    required: true
  },
  friend: {
    type: _mongoose2.default.Schema.Types.ObjectId,
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
});
FriendSchema.index({ whose: 1, friend: 1 });
var Friend = null;
try {
  Friend = _mongoose2.default.model('Friend', FriendSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Friend = _mongoose2.default.model('Friend');
  }
}

var generateFriendModel = function generateFriendModel(token) {
  return {
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
    addFriend: function addFriend(_ref, context) {
      var friend = _ref.friend,
          validateMessage = _ref.validateMessage;

      return new Promise(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
          var logedUser, data, doc, initiator;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;

                  if (token) {
                    _context.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _context.next = 5;
                  return (0, _utils.getUser)(token);

                case 5:
                  logedUser = _context.sent;
                  data = { friend: friend, validateMessage: validateMessage, whose: logedUser._id };
                  _context.next = 9;
                  return new Friend(data).save();

                case 9:
                  doc = _context.sent;
                  _context.next = 12;
                  return context.models.User.byId({ id: doc.whose });

                case 12:
                  initiator = _context.sent;

                  pubsub.publish('friendAdded', { friendAdded: _extends({}, doc.toObject(), { initiator: initiator, id: doc._id }) });
                  resolve(doc);
                  _context.next = 20;
                  break;

                case 17:
                  _context.prev = 17;
                  _context.t0 = _context['catch'](0);

                  reject((0, _utils.wrapError)(_context.t0));

                case 20:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[0, 17]]);
        }));

        return function (_x, _x2) {
          return _ref2.apply(this, arguments);
        };
      }());
    },
    approveFriend: function approveFriend(_ref3, context) {
      var id = _ref3.id;

      return new Promise(function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var doc, initiator;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.prev = 0;

                  if (token) {
                    _context2.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _context2.next = 5;
                  return Friend.findByIdAndUpdate(id, { state: 'Approved' }, { new: true }).exec();

                case 5:
                  doc = _context2.sent;
                  _context2.next = 8;
                  return context.models.User.byId({ id: doc.whose });

                case 8:
                  initiator = _context2.sent;

                  pubsub.publish('friendApproved', { friendApproved: _extends({}, doc.toObject(), { initiator: initiator, id: doc._id }) });
                  resolve(doc);
                  _context2.next = 16;
                  break;

                case 13:
                  _context2.prev = 13;
                  _context2.t0 = _context2['catch'](0);

                  reject((0, _utils.wrapError)(_context2.t0));

                case 16:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, undefined, [[0, 13]]);
        }));

        return function (_x3, _x4) {
          return _ref4.apply(this, arguments);
        };
      }());
    },
    getUnapprovedFriends: function getUnapprovedFriends() {
      return new Promise(function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
          var logedUser, friends;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.prev = 0;
                  _context3.next = 3;
                  return (0, _utils.getUser)(token);

                case 3:
                  logedUser = _context3.sent;

                  if (logedUser) {
                    _context3.next = 6;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 6:
                  _context3.next = 8;
                  return Friend.find({
                    state: 'Unapproved',
                    friend: logedUser._id
                  }).exec();

                case 8:
                  friends = _context3.sent;

                  resolve(friends);
                  _context3.next = 15;
                  break;

                case 12:
                  _context3.prev = 12;
                  _context3.t0 = _context3['catch'](0);

                  reject((0, _utils.wrapError)(_context3.t0));

                case 15:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, undefined, [[0, 12]]);
        }));

        return function (_x5, _x6) {
          return _ref5.apply(this, arguments);
        };
      }());
    },
    getFriends: function getFriends(_ref6, context) {
      var _this = this;

      var skip = _ref6.skip,
          limit = _ref6.limit;

      return new Promise(function () {
        var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve, reject) {
          var logedUser, result;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;

                  if (token) {
                    _context4.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _context4.next = 5;
                  return (0, _utils.getUser)(token);

                case 5:
                  logedUser = _context4.sent;
                  _context4.next = 8;
                  return Friend.aggregate().facet({
                    others: [{
                      $match: { state: 'Approved', friend: logedUser._id }
                    }, {
                      $lookup: {
                        from: 'users',
                        localField: 'whose',
                        foreignField: '_id',
                        as: 'user'
                      }
                    }],
                    mine: [{
                      $match: { state: 'Approved', whose: logedUser._id }
                    }, {
                      $lookup: {
                        from: 'users',
                        localField: 'friend',
                        foreignField: '_id',
                        as: 'user'
                      }
                    }]
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
                      $push: { $arrayElemAt: ['$users.user', 0] }
                    }
                  }).project({
                    _id: 0,
                    group: '$_id',
                    friends: 1
                  }).sort('group').skip(skip).limit(limit).exec();

                case 8:
                  result = _context4.sent;

                  resolve(result);
                  _context4.next = 15;
                  break;

                case 12:
                  _context4.prev = 12;
                  _context4.t0 = _context4['catch'](0);

                  reject((0, _utils.wrapError)(_context4.t0));

                case 15:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, _this, [[0, 12]]);
        }));

        return function (_x7, _x8) {
          return _ref7.apply(this, arguments);
        };
      }());
    }
  };
};
module.exports = { Friend: Friend, generateFriendModel: generateFriendModel };
//# sourceMappingURL=Friend.js.map