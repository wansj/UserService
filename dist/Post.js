'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generatePostModel = exports.Post = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("apollo-server-errors"),
    AuthenticationError = _require.AuthenticationError;

var PostSchema = _mongoose2.default.Schema({
  postBy: {
    type: _mongoose2.default.Schema.Types.ObjectId,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  iat: {
    type: Date,
    default: Date.now()
  },
  read: {
    type: Map,
    of: Boolean,
    required: true
  },
  sessionId: {
    type: _mongoose2.default.Schema.Types.ObjectId,
    required: true
  }
});
var Post = null;
try {
  exports.Post = Post = _mongoose2.default.model('Post', PostSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    exports.Post = Post = _mongoose2.default.model('Post');
  }
}

var generatePostModel = function generatePostModel(token) {
  return {
    addPost: function addPost(_ref) {
      var message = _ref.message,
          sessionId = _ref.sessionId;

      return new Promise(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
          var logedUser, Conversation, _ref3, participators, read, post, conversation;

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
                  Conversation = require('./Conversation').Conversation;
                  _context.next = 9;
                  return Conversation.findById(sessionId, 'participators').exec();

                case 9:
                  _ref3 = _context.sent;
                  participators = _ref3.participators;

                  console.log(participators.length);
                  read = participators.filter(function (userId) {
                    return userId !== logedUser._id;
                  }).map(function (id) {
                    return _defineProperty({}, id, false);
                  });

                  console.log(read.length);
                  post = {
                    message: message,
                    sessionId: sessionId,
                    read: read,
                    postBy: logedUser._id
                  };
                  _context.next = 17;
                  return new Post(post).save();

                case 17:
                  conversation = _context.sent;

                  resolve(conversation);
                  _context.next = 24;
                  break;

                case 21:
                  _context.prev = 21;
                  _context.t0 = _context['catch'](0);

                  reject((0, _utils.wrapError)(_context.t0));

                case 24:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[0, 21]]);
        }));

        return function (_x, _x2) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
  };
};
exports.Post = Post;
exports.generatePostModel = generatePostModel;
//# sourceMappingURL=Post.js.map