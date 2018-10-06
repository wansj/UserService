'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _settings = require('./settings');

var _utils = require('./utils');

var _Role4 = require('./Role');

var _graphqlRedisSubscriptions = require('graphql-redis-subscriptions');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("apollo-server-errors"),
    ValidationError = _require.ValidationError,
    ForbiddenError = _require.ForbiddenError,
    AuthenticationError = _require.AuthenticationError;

var jwt = require('jsonwebtoken');
var pinyin = require("pinyin");
var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true },
  pinyin: { type: String, required: true },
  password: {
    type: String,
    required: true,
    min: [6, '密码不能少于6个字符'],
    max: [20, '密码不能超过20个字符'],
    validate: {
      validator: function validator(v) {
        return !/\W/g.test(v);
      },
      message: function message(props) {
        return '密码只能是字母、数字或下划线!';
      }
    }
  },
  department: { type: String, required: true },
  role: { type: String, required: true },
  loged: { type: Boolean, required: true, default: false },
  avatar: String,
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function validator(v) {
        return (/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v)
        );
      },
      message: function message(props) {
        return props.value + '\u4E0D\u662F\u6B63\u786E\u7684\u7535\u5B50\u90AE\u4EF6\u683C\u5F0F';
      }
    }
  }
});
var User = null;
try {
  User = mongoose.model('User', UserSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    User = mongoose.model('User');
  }
}
var pubsub = new _graphqlRedisSubscriptions.RedisPubSub();
var registerLogOutListener = function registerLogOutListener(token) {
  var timer = setTimeout(function () {
    var decoded = jwt.decode(token);
    User.findByIdAndUpdate(decoded.userId, { loged: false }).exec();
    clearTimeout(timer);
    console.log('登陆过期，已自动退出登陆');
    pubsub.publish('tokenExpired', { tokenExpired: token });
  }, _settings.expiresIn * 1000);
};
var exceedAdminCount = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var _require2, Role, roles, ids, adminCount;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _require2 = require('./Role'), Role = _require2.Role;
            _context.next = 3;
            return Role.find({ isAdmin: true }).exec();

          case 3:
            roles = _context.sent;
            ids = roles.map(function (role) {
              return role.id;
            });
            _context.next = 7;
            return User.count({ role: { $in: ids } }).exec();

          case 7:
            adminCount = _context.sent;
            return _context.abrupt('return', adminCount >= _settings.AdminUsersCount);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function exceedAdminCount() {
    return _ref.apply(this, arguments);
  };
}();
var translate = function translate(username) {
  var array = pinyin(username, { style: pinyin.STYLE_NORMAL });
  return array.reduce(function (memo, char) {
    var _memo;

    memo = (_memo = memo).push.apply(_memo, _toConsumableArray(char));
    return memo;
  }, []).join('');
};
var generateUserModel = function generateUserModel(token) {
  return {
    // createSampleUsers: () => {
    //   return new Promise(async (resolve, reject) => {
    //     try {
    //       const data = []
    //       for (let i=0;i<26;i++) {
    //         const username = `${String.fromCharCode(65 + i)}TestUser`
    //         data.push({
    //           username,
    //           pinyin: username.toLowerCase(),
    //           password: '123456',
    //           role: '5b593639fc96452d7563a4f8',
    //           department: '无',
    //           email: `test${i}@example.com`
    //         })
    //       }
    //       await User.insertMany(data)
    //       resolve(true)
    //     } catch (e) {
    //       reject(e)
    //     }
    //   })
    // },
    signUp: function signUp(_ref2) {
      var password = _ref2.password,
          rest = _objectWithoutProperties(_ref2, ['password']);

      return new Promise(function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var uncrypted, translation, doc;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.prev = 0;

                  if (!(exceedAdminCount() && rest.isAdmin)) {
                    _context2.next = 3;
                    break;
                  }

                  throw new ForbiddenError('管理员账户已达到最大数量');

                case 3:
                  uncrypted = (0, _utils.decryptPassword)(password);
                  translation = translate(rest.username);
                  _context2.next = 7;
                  return new User(_extends({}, rest, { pinyin: translation, password: uncrypted, loged: true })).save();

                case 7:
                  doc = _context2.sent;

                  jwt.sign({ userId: doc._id }, _settings.secret, { expiresIn: _settings.expiresIn }, function (err, signature) {
                    if (err) throw err;else {
                      registerLogOutListener(signature);
                      resolve({ token: signature, user: doc });
                    }
                  });
                  _context2.next = 15;
                  break;

                case 11:
                  _context2.prev = 11;
                  _context2.t0 = _context2['catch'](0);

                  if (_context2.t0.message.indexOf('duplicate key error') > -1) reject(new ValidationError('用户名或电子邮件已经被使用'));
                  reject((0, _utils.wrapError)(_context2.t0));

                case 15:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, undefined, [[0, 11]]);
        }));

        return function (_x, _x2) {
          return _ref3.apply(this, arguments);
        };
      }());
    },
    delete: function _delete(_ref4) {
      var userId = _ref4.userId;

      return new Promise(function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
          var user, _require3, _Role2, role;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.prev = 0;

                  if (token) {
                    _context3.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _context3.next = 5;
                  return (0, _utils.getUser)(token);

                case 5:
                  user = _context3.sent;
                  _require3 = require('./Role'), _Role2 = _require3.Role;
                  _context3.next = 9;
                  return _Role2.findById(user.role).exec();

                case 9:
                  role = _context3.sent;

                  if (role.isAdmin) {
                    _context3.next = 12;
                    break;
                  }

                  throw new ForbiddenError('无权删除用户');

                case 12:
                  _context3.next = 14;
                  return User.findByIdAndDelete(userId).exec();

                case 14:
                  resolve(true);
                  _context3.next = 20;
                  break;

                case 17:
                  _context3.prev = 17;
                  _context3.t0 = _context3['catch'](0);

                  reject((0, _utils.wrapError)(_context3.t0));

                case 20:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, undefined, [[0, 17]]);
        }));

        return function (_x3, _x4) {
          return _ref5.apply(this, arguments);
        };
      }());
    },
    // username,password,department可以由用户自己更改，role只有管理员才能改，管理员可以修改所有人的信息，所以userId可以和当前登陆用户的id不一样
    update: function update(_ref6) {
      var userId = _ref6.userId,
          rest = _objectWithoutProperties(_ref6, ['userId']);

      return new Promise(function () {
        var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve, reject) {
          var logedUser, _require4, _Role3, role, role2, translation, password, update, user;

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
                  _require4 = require('./Role'), _Role3 = _require4.Role;
                  _context4.next = 9;
                  return _Role3.findById(logedUser.role).exec();

                case 9:
                  role = _context4.sent;

                  if (!(!role.isAdmin && rest.role)) {
                    _context4.next = 12;
                    break;
                  }

                  throw new ForbiddenError('只有管理员才可以指定角色');

                case 12:
                  if (!(!role.isAdmin && userId !== logedUser.id)) {
                    _context4.next = 14;
                    break;
                  }

                  throw new ForbiddenError('不能修改别人的信息');

                case 14:
                  if (!rest.role) {
                    _context4.next = 20;
                    break;
                  }

                  _context4.next = 17;
                  return _Role3.findById(rest.role).exec();

                case 17:
                  role2 = _context4.sent;

                  if (!(role2.isAdmin && exceedAdminCount())) {
                    _context4.next = 20;
                    break;
                  }

                  throw new ForbiddenError('管理员账户已达到最大数量');

                case 20:
                  translation = rest.username ? { pinyin: translate(rest.username) } : {};
                  password = rest.password ? { password: (0, _utils.decryptPassword)(rest.password) } : {};
                  update = _extends({}, rest, password, translation);
                  _context4.next = 25;
                  return User.findByIdAndUpdate(userId, update, { new: true }).exec();

                case 25:
                  user = _context4.sent;

                  resolve(user);
                  _context4.next = 32;
                  break;

                case 29:
                  _context4.prev = 29;
                  _context4.t0 = _context4['catch'](0);

                  reject((0, _utils.wrapError)(_context4.t0));

                case 32:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, undefined, [[0, 29]]);
        }));

        return function (_x5, _x6) {
          return _ref7.apply(this, arguments);
        };
      }());
    },
    changePassword: function changePassword(_ref8) {
      var email = _ref8.email,
          password = _ref8.password;

      return new Promise(function () {
        var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve, reject) {
          var user;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.prev = 0;
                  _context5.next = 3;
                  return User.findOneAndUpdate({ email: email }, { password: (0, _utils.decryptPassword)(password) }, { new: true }).exec();

                case 3:
                  user = _context5.sent;

                  resolve(user);
                  _context5.next = 10;
                  break;

                case 7:
                  _context5.prev = 7;
                  _context5.t0 = _context5['catch'](0);

                  reject((0, _utils.wrapError)(_context5.t0));

                case 10:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, undefined, [[0, 7]]);
        }));

        return function (_x7, _x8) {
          return _ref9.apply(this, arguments);
        };
      }());
    },
    logIn: function logIn(_ref10) {
      var username = _ref10.username,
          password = _ref10.password;

      return new Promise(function () {
        var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(resolve, reject) {
          var doc, uncrypted;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  _context6.prev = 0;
                  _context6.next = 3;
                  return User.findOne({ username: username }).exec();

                case 3:
                  doc = _context6.sent;
                  uncrypted = (0, _utils.decryptPassword)(password);

                  if (!(uncrypted !== doc.password)) {
                    _context6.next = 7;
                    break;
                  }

                  throw new ValidationError('密码错误');

                case 7:
                  doc.loged = true;
                  _context6.next = 10;
                  return doc.save();

                case 10:
                  doc = _context6.sent;

                  jwt.sign({ userId: doc._id }, _settings.secret, { expiresIn: _settings.expiresIn }, function (err, signature) {
                    if (err) throw err;else {
                      registerLogOutListener(signature);
                      resolve({ token: signature, user: doc });
                    }
                  });
                  _context6.next = 17;
                  break;

                case 14:
                  _context6.prev = 14;
                  _context6.t0 = _context6['catch'](0);

                  reject((0, _utils.wrapError)(_context6.t0));

                case 17:
                case 'end':
                  return _context6.stop();
              }
            }
          }, _callee6, undefined, [[0, 14]]);
        }));

        return function (_x9, _x10) {
          return _ref11.apply(this, arguments);
        };
      }());
    },
    logOut: function logOut() {
      return new Promise(function () {
        var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve, reject) {
          var user;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  _context7.prev = 0;

                  if (token) {
                    _context7.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _context7.next = 5;
                  return (0, _utils.getUser)(token);

                case 5:
                  user = _context7.sent;

                  user.loged = false;
                  _context7.next = 9;
                  return user.save();

                case 9:
                  resolve(true);
                  _context7.next = 15;
                  break;

                case 12:
                  _context7.prev = 12;
                  _context7.t0 = _context7['catch'](0);

                  reject((0, _utils.wrapError)(_context7.t0));

                case 15:
                case 'end':
                  return _context7.stop();
              }
            }
          }, _callee7, undefined, [[0, 12]]);
        }));

        return function (_x11, _x12) {
          return _ref12.apply(this, arguments);
        };
      }());
    },
    listUsers: function listUsers(_ref13) {
      var skip = _ref13.skip,
          limit = _ref13.limit;

      return new Promise(function () {
        var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(resolve, reject) {
          var user, _Role, role, query;

          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  _context8.prev = 0;

                  if (token) {
                    _context8.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _context8.next = 5;
                  return (0, _utils.getUser)(token);

                case 5:
                  user = _context8.sent;
                  _Role = require('./Role').Role;
                  _context8.next = 9;
                  return _Role.findById(user.role).exec();

                case 9:
                  role = _context8.sent;

                  if (role.isAdmin) {
                    _context8.next = 14;
                    break;
                  }

                  throw new ForbiddenError('无权限查看所有用户');

                case 14:
                  query = User.find({});

                  if (typeof skip === 'number') query = query.skip(skip);
                  if (typeof limit === 'number') query = query.limit(limit);
                  _context8.t0 = resolve;
                  _context8.next = 20;
                  return query.exec();

                case 20:
                  _context8.t1 = _context8.sent;
                  (0, _context8.t0)(_context8.t1);

                case 22:
                  _context8.next = 27;
                  break;

                case 24:
                  _context8.prev = 24;
                  _context8.t2 = _context8['catch'](0);

                  reject((0, _utils.wrapError)(_context8.t2));

                case 27:
                case 'end':
                  return _context8.stop();
              }
            }
          }, _callee8, undefined, [[0, 24]]);
        }));

        return function (_x13, _x14) {
          return _ref14.apply(this, arguments);
        };
      }());
    },
    getLogedUser: function getLogedUser() {
      return new Promise(function () {
        var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(resolve, reject) {
          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  _context9.prev = 0;

                  if (token) {
                    _context9.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _context9.t0 = resolve;
                  _context9.next = 6;
                  return (0, _utils.getUser)(token);

                case 6:
                  _context9.t1 = _context9.sent;
                  (0, _context9.t0)(_context9.t1);
                  _context9.next = 13;
                  break;

                case 10:
                  _context9.prev = 10;
                  _context9.t2 = _context9['catch'](0);

                  reject((0, _utils.wrapError)(_context9.t2));

                case 13:
                case 'end':
                  return _context9.stop();
              }
            }
          }, _callee9, undefined, [[0, 10]]);
        }));

        return function (_x15, _x16) {
          return _ref15.apply(this, arguments);
        };
      }());
    },
    byId: function byId(_ref16) {
      var id = _ref16.id;

      return User.findById(id).exec();
    },
    byName: function byName(_ref17) {
      var username = _ref17.username;

      return new Promise(function () {
        var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(resolve, reject) {
          var user, _Role, role;

          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  _context10.prev = 0;

                  if (token) {
                    _context10.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _context10.next = 5;
                  return (0, _utils.getUser)(token);

                case 5:
                  user = _context10.sent;
                  _Role = require('./Role').Role;
                  _context10.next = 9;
                  return _Role.findById(user.role).exec();

                case 9:
                  role = _context10.sent;

                  if (role.isAdmin) {
                    _context10.next = 12;
                    break;
                  }

                  throw new ForbiddenError('没有权限');

                case 12:
                  _context10.t0 = resolve;
                  _context10.next = 15;
                  return User.findOne({ username: username }).exec();

                case 15:
                  _context10.t1 = _context10.sent;
                  (0, _context10.t0)(_context10.t1);
                  _context10.next = 22;
                  break;

                case 19:
                  _context10.prev = 19;
                  _context10.t2 = _context10['catch'](0);

                  reject(_context10.t2);

                case 22:
                case 'end':
                  return _context10.stop();
              }
            }
          }, _callee10, undefined, [[0, 19]]);
        }));

        return function (_x17, _x18) {
          return _ref18.apply(this, arguments);
        };
      }());
    },
    byNameOrEmail: function byNameOrEmail(_ref19) {
      var search = _ref19.search;

      return new Promise(function () {
        var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(resolve, reject) {
          var _jwt$verify, userId, result;

          return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  _context11.prev = 0;

                  if (token) {
                    _context11.next = 3;
                    break;
                  }

                  throw new AuthenticationError('用户未登陆');

                case 3:
                  _jwt$verify = jwt.verify(token, _settings.secret), userId = _jwt$verify.userId;
                  // 首先使用facet查出当前登录用户和被检索的用户

                  _context11.next = 6;
                  return User.aggregate().facet({
                    whose: [{
                      $match: {
                        $expr: {
                          $eq: [userId, { $toString: '$_id' }]
                        }
                      }
                    }],
                    friend: [{
                      $match: {
                        $or: [{ username: search }, { email: search }]
                      }
                    }]
                  }).project({ // 用whose和friend来保存当前登录用户和被检索用户的_id，user保存被检索用户的全部字段
                    whose: { $arrayElemAt: ['$whose._id', 0] },
                    friend: {
                      $cond: [{ $gt: [{ $size: '$friend' }, 0] }, { $arrayElemAt: ['$friend._id', 0] }, '']
                    },
                    user: {
                      $cond: [{ $gt: [{ $size: '$friend' }, 0] }, { $arrayElemAt: ['$friend', 0] }, null]
                    }
                  }).lookup({ // 使用lookup的另一种语法，链接friends集合，查询当前登录用户和被检索用户之间是否存在朋友关系
                    from: 'friends',
                    let: { whoseId: '$whose', friendId: '$friend' },
                    pipeline: [{
                      $match: {
                        $expr: {
                          $or: [{ $and: [{ $eq: ['$whose', '$$whoseId'] }, { $eq: ['$friend', '$$friendId'] }] }, { $and: [{ $eq: ['$whose', '$$friendId'] }, { $eq: ['$friend', '$$whoseId'] }] }]
                        }
                      }
                    }],
                    as: 'friendship'
                    // 根据前面几步，friend字段直接返回被检索到的用户，如果没有检索到用户就返回null，status字段返回当前登录用户和被检索用户之间的朋友关系状态：
                    // None代表没有朋友关系，或者返回查询到的friend的state字段，有2个可能的值：Unapproved代表等待验证，Approved代表已通过朋友验证
                  }).project({
                    friend: '$user',
                    status: {
                      $cond: [{ $gt: [{ $size: '$friendship' }, 0] }, { $arrayElemAt: ['$friendship.state', 0] }, 'None']
                    }
                  }).exec();

                case 6:
                  result = _context11.sent;

                  // console.log(JSON.stringify(result))
                  resolve(result[0]);
                  _context11.next = 13;
                  break;

                case 10:
                  _context11.prev = 10;
                  _context11.t0 = _context11['catch'](0);

                  reject((0, _utils.wrapError)(_context11.t0));

                case 13:
                case 'end':
                  return _context11.stop();
              }
            }
          }, _callee11, undefined, [[0, 10]]);
        }));

        return function (_x19, _x20) {
          return _ref20.apply(this, arguments);
        };
      }());
    },
    getCaptcha: function getCaptcha(_ref21) {
      var email = _ref21.email;

      var nodemailer = require('nodemailer');
      return new Promise(function () {
        var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(resolve, reject) {
          var user, svgCaptcha, captcha, transporter, mailOptions;
          return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _context12.next = 2;
                  return User.findOne({ email: email }).exec();

                case 2:
                  user = _context12.sent;

                  if (!user) reject(new ForbiddenError(email + '\u4E0D\u662F\u5BC6\u4FDD\u90AE\u7BB1\uFF0C\u8BF7\u8F93\u5165\u6CE8\u518C\u7528\u6237\u65F6\u586B\u5199\u7684\u90AE\u7BB1'));
                  svgCaptcha = require('svg-captcha');
                  captcha = svgCaptcha.create();
                  transporter = nodemailer.createTransport({
                    host: 'smtp.163.com',
                    port: 465,
                    secure: true,
                    auth: {
                      user: _settings.emailAccount,
                      pass: _settings.emailPassword
                    }
                  });
                  mailOptions = {
                    from: '"管理员" <wsj-88488111@163.com>',
                    to: email,
                    subject: '找回密码',
                    text: captcha.text,
                    html: '<div><h1>\u9A8C\u8BC1\u7801\u4E3A:</h1>' + captcha.data + '</div>'
                  };

                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      reject((0, _utils.wrapError)(error));
                    }
                    resolve(captcha.text);
                  });

                case 9:
                case 'end':
                  return _context12.stop();
              }
            }
          }, _callee12, undefined);
        }));

        return function (_x21, _x22) {
          return _ref22.apply(this, arguments);
        };
      }());
    }
  };
};
module.exports = { User: User, generateUserModel: generateUserModel };
//# sourceMappingURL=User.js.map