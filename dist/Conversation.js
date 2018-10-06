'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateConversationModel = exports.Conversation = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("apollo-server-errors"),
    AuthenticationError = _require.AuthenticationError;

var ConversationSchema = _mongoose2.default.Schema({
  participators: {
    type: [_mongoose2.default.Schema.Types.ObjectId],
    required: true,
    validate: {
      validator: function validator(v) {
        return v.length >= 2;
      },
      message: '会话至少需要两个人'
    }
  },
  posts: {
    type: [_mongoose2.default.Schema.Types.ObjectId],
    default: []
  }
});
var Conversation = null;
try {
  exports.Conversation = Conversation = _mongoose2.default.model('Conversation', ConversationSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    exports.Conversation = Conversation = _mongoose2.default.model('Conversation');
  }
}

var generateConversationModel = function generateConversationModel(token) {
  return {
    establishConversation: function establishConversation(_ref) {
      var participators = _ref.participators;

      return new Promise(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
          var logedUser, conversation;
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
                  _context.next = 8;
                  return new Conversation({ participators: [].concat(_toConsumableArray(participators), [logedUser._id]) }).save();

                case 8:
                  conversation = _context.sent;

                  resolve(conversation);
                  _context.next = 15;
                  break;

                case 12:
                  _context.prev = 12;
                  _context.t0 = _context['catch'](0);

                  reject((0, _utils.wrapError)(_context.t0));

                case 15:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[0, 12]]);
        }));

        return function (_x, _x2) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
  };
};
exports.Conversation = Conversation;
exports.generateConversationModel = generateConversationModel;
//# sourceMappingURL=Conversation.js.map