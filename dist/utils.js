'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapError = exports.decryptPassword = exports.getPublicKey = exports.getUser = undefined;

var _graphqlRedisSubscriptions = require('graphql-redis-subscriptions');

var _settings = require('./settings');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("apollo-server-errors"),
    ApolloError = _require.ApolloError;

var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var ursa = require('ursa');
// 返回的是promise，调用的时候必须实用await
var getUser = exports.getUser = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(token) {
    var _require2, User, _jwt$verify, userId, user, decoded, pubsub;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _require2 = require('./User'), User = _require2.User;
            _context.prev = 1;
            _jwt$verify = jwt.verify(token, _settings.secret), userId = _jwt$verify.userId;
            // User不能在最前面使用import导入，因为User.js里导入了util.js,util.js里也要导入User.js，这样会导致util.js导入User的时候
            // User还是undefined,所以要把User的导入放在函数里，这样才能确保导入User的时候User已经初始化了

            _context.next = 5;
            return User.findOne({ _id: userId, loged: true }).exec();

          case 5:
            user = _context.sent;
            return _context.abrupt('return', user);

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](1);

            if (!(_context.t0.name === 'TokenExpiredError')) {
              _context.next = 19;
              break;
            }

            decoded = jwt.decode(token);

            User.findByIdAndUpdate(decoded.userId, { loged: false }).exec();
            console.log('登陆过期，已自动退出登陆');
            pubsub = new _graphqlRedisSubscriptions.RedisPubSub();

            pubsub.publish('tokenExpired', { tokenExpired: token });
            _context.next = 20;
            break;

          case 19:
            throw _context.t0;

          case 20:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[1, 9]]);
  }));

  return function getUser(_x) {
    return _ref.apply(this, arguments);
  };
}();
var getPublicKey = exports.getPublicKey = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt('return', new Promise(function (resolve, reject) {
              fs.readFile(path.join(__dirname, '../rsa_1024_pub.pem'), function (err, data) {
                if (err) reject(err);else resolve(data);
              });
            }));

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function getPublicKey() {
    return _ref2.apply(this, arguments);
  };
}();
var decryptPassword = exports.decryptPassword = function decryptPassword(password) {
  var key = ursa.createPrivateKey(fs.readFileSync(path.join(__dirname, '../rsa_1024_priv.pem')));
  return key.decrypt(password, 'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
};
var wrapError = exports.wrapError = function wrapError(err) {
  if (err instanceof ApolloError) return err;else return new ApolloError(err.message, err.name);
};
//# sourceMappingURL=utils.js.map