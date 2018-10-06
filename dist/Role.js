'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils');

var _User2 = require('./User');

var _settings = require('./settings');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require('mongoose');

var _require = require("apollo-server-errors"),
    ForbiddenError = _require.ForbiddenError,
    SyntaxError = _require.SyntaxError,
    AuthenticationError = _require.AuthenticationError;

var RoleSchema = mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: String,
  isAdmin: { type: Boolean, default: false, required: true },
  maxBorrowDuration: { type: Number, default: 90, required: true },
  maxHoldCount: { type: Number, default: 5, required: true },
  maxDelayTimes: { type: Number, default: 1, required: true },
  maxDelayDays: { type: Number, default: 30, required: true }
});
var Role = null;
try {
  Role = mongoose.model('Role', RoleSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Role = mongoose.model('Role');
  }
}

var generateRoleModel = function generateRoleModel(token) {
  return {
    byId: function byId(id) {
      return Role.findById(id).exec();
    },
    createRole: function createRole(args) {
      return new Promise(function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
          var user, role, doc;
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
                  user = _context.sent;

                  if (user.role) {
                    _context.next = 8;
                    break;
                  }

                  throw new SyntaxError('\u7528\u6237' + user.username + '\u89D2\u8272\u672A\u5B9A\u4E49');

                case 8:
                  _context.next = 10;
                  return Role.findById(user.role).exec();

                case 10:
                  role = _context.sent;

                  if (role.isAdmin) {
                    _context.next = 13;
                    break;
                  }

                  throw new ForbiddenError('\u7528\u6237' + user.username + '\u65E0\u6743\u9650\u521B\u5EFA\u89D2\u8272');

                case 13:
                  _context.next = 15;
                  return new Role(_extends({}, args)).save();

                case 15:
                  doc = _context.sent;

                  resolve(doc);
                  _context.next = 22;
                  break;

                case 19:
                  _context.prev = 19;
                  _context.t0 = _context['catch'](0);

                  reject((0, _utils.wrapError)(_context.t0));

                case 22:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[0, 19]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    },
    delete: function _delete(_ref2) {
      var id = _ref2.id;

      return new Promise(function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var user, role, linkedUsers, usernames;
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
                  return (0, _utils.getUser)(token);

                case 5:
                  user = _context2.sent;

                  if (user.role) {
                    _context2.next = 8;
                    break;
                  }

                  throw new SyntaxError('\u7528\u6237' + user.username + '\u89D2\u8272\u672A\u5B9A\u4E49');

                case 8:
                  _context2.next = 10;
                  return Role.findById(user.role).exec();

                case 10:
                  role = _context2.sent;

                  if (role.isAdmin) {
                    _context2.next = 13;
                    break;
                  }

                  throw new ForbiddenError('\u7528\u6237' + user.username + '\u65E0\u6743\u9650\u5220\u9664\u89D2\u8272');

                case 13:
                  _context2.next = 15;
                  return _User2.User.find({ role: id }).exec();

                case 15:
                  linkedUsers = _context2.sent;

                  if (!(linkedUsers.length > 0)) {
                    _context2.next = 19;
                    break;
                  }

                  usernames = linkedUsers.map(function (user) {
                    return user.username;
                  }).join('、');
                  throw new ForbiddenError('\u8981\u5220\u9664\u7684\u89D2\u8272\u4E0A\u5DF2\u5173\u8054\u4E86\u7528\u6237\uFF0C\u5FC5\u987B\u5148\u4E3A\u5DF2\u5173\u8054\u7528\u6237\u540E\u91CD\u65B0\u6307\u5B9A\u89D2\u8272\u3002\u5173\u8054\u7684\u7528\u6237\u6709\uFF1A' + usernames);

                case 19:
                  _context2.next = 21;
                  return Role.findByIdAndDelete(id).exec();

                case 21:
                  resolve(true);
                  _context2.next = 27;
                  break;

                case 24:
                  _context2.prev = 24;
                  _context2.t0 = _context2['catch'](0);

                  reject((0, _utils.wrapError)(_context2.t0));

                case 27:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, undefined, [[0, 24]]);
        }));

        return function (_x3, _x4) {
          return _ref3.apply(this, arguments);
        };
      }());
    },
    update: function update(_ref4) {
      var id = _ref4.id,
          rest = _objectWithoutProperties(_ref4, ['id']);

      return new Promise(function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
          var user, role;
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

                  if (user.role) {
                    _context3.next = 8;
                    break;
                  }

                  throw new SyntaxError('\u7528\u6237' + user.username + '\u89D2\u8272\u672A\u5B9A\u4E49');

                case 8:
                  _context3.next = 10;
                  return Role.findById(user.role).exec();

                case 10:
                  role = _context3.sent;

                  if (role.isAdmin) {
                    _context3.next = 13;
                    break;
                  }

                  throw new ForbiddenError('\u7528\u6237' + user.username + '\u65E0\u6743\u9650\u4FEE\u6539\u89D2\u8272');

                case 13:
                  if (!(Object.keys(rest).length === 0)) {
                    _context3.next = 15;
                    break;
                  }

                  throw new ForbiddenError('要修改的内容不能为空');

                case 15:
                  _context3.next = 17;
                  return Role.findByIdAndUpdate(id, rest, { new: true }).exec();

                case 17:
                  role = _context3.sent;

                  resolve(role);
                  _context3.next = 24;
                  break;

                case 21:
                  _context3.prev = 21;
                  _context3.t0 = _context3['catch'](0);

                  reject((0, _utils.wrapError)(_context3.t0));

                case 24:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, undefined, [[0, 21]]);
        }));

        return function (_x5, _x6) {
          return _ref5.apply(this, arguments);
        };
      }());
    },
    listRoles: function listRoles() {
      return new Promise(function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve, reject) {
          var user, role, roles;
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
                  user = _context4.sent;

                  if (user.role) {
                    _context4.next = 8;
                    break;
                  }

                  throw new SyntaxError('\u7528\u6237' + user.username + '\u89D2\u8272\u672A\u5B9A\u4E49');

                case 8:
                  _context4.next = 10;
                  return Role.findById(user.role).exec();

                case 10:
                  role = _context4.sent;

                  if (role.isAdmin) {
                    _context4.next = 13;
                    break;
                  }

                  throw new ForbiddenError('\u7528\u6237' + user.username + '\u65E0\u6743\u9650\u67E5\u770B\u89D2\u8272');

                case 13:
                  _context4.next = 15;
                  return Role.find({}).exec();

                case 15:
                  roles = _context4.sent;

                  resolve(roles);
                  _context4.next = 22;
                  break;

                case 19:
                  _context4.prev = 19;
                  _context4.t0 = _context4['catch'](0);

                  reject((0, _utils.wrapError)(_context4.t0));

                case 22:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, undefined, [[0, 19]]);
        }));

        return function (_x7, _x8) {
          return _ref6.apply(this, arguments);
        };
      }());
    },
    // 如果管理员账户数量已达到设置值，则关闭管理员账户注册功能，此方法将仅返回非管理员角色
    availableRoles: function availableRoles() {
      return new Promise(function () {
        var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve, reject) {
          var roles, ids, _require2, _User, count, query;

          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.prev = 0;
                  _context5.next = 3;
                  return Role.find({ isAdmin: true }).exec();

                case 3:
                  roles = _context5.sent;
                  ids = roles.map(function (role) {
                    return role.id;
                  });
                  _require2 = require('./User'), _User = _require2.User;
                  _context5.next = 8;
                  return _User.count({ role: { $in: ids } }).exec();

                case 8:
                  count = _context5.sent;
                  query = count < _settings.AdminUsersCount ? {} : { isAdmin: false };
                  _context5.t0 = resolve;
                  _context5.next = 13;
                  return Role.find(query).exec();

                case 13:
                  _context5.t1 = _context5.sent;
                  (0, _context5.t0)(_context5.t1);
                  _context5.next = 20;
                  break;

                case 17:
                  _context5.prev = 17;
                  _context5.t2 = _context5['catch'](0);

                  reject((0, _utils.wrapError)(_context5.t2));

                case 20:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, undefined, [[0, 17]]);
        }));

        return function (_x9, _x10) {
          return _ref7.apply(this, arguments);
        };
      }());
    }
  };
};
module.exports = { Role: Role, generateRoleModel: generateRoleModel };
//# sourceMappingURL=Role.js.map