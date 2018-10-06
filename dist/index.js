'use strict';

require('regenerator-runtime/runtime');

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _resolvers = require('./resolvers');

var _resolvers2 = _interopRequireDefault(_resolvers);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _User = require('./User');

var _Role = require('./Role');

var _Friend = require('./Friend');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('microrouter'),
    router = _require.router,
    get = _require.get,
    post = _require.post,
    options = _require.options;

var _require2 = require('apollo-server-micro'),
    ApolloServer = _require2.ApolloServer;

var cors = require('micro-cors')();

var server = new ApolloServer({
  typeDefs: _schema2.default,
  resolvers: _resolvers2.default,
  context: function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
      var req = _ref.req;
      var Authorization, token;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              Authorization = req.headers.authorization || '';
              // console.log(req.headers)

              token = Authorization.replace('Bearer ', '');
              return _context.abrupt('return', {
                models: {
                  User: (0, _User.generateUserModel)(token),
                  Role: (0, _Role.generateRoleModel)(token),
                  Friend: (0, _Friend.generateFriendModel)(token)
                }
              });

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    function context(_x) {
      return _ref2.apply(this, arguments);
    }

    return context;
  }()
});
var graphqlPath = '/graphqlUser';
var graphqlHandler = cors(server.createHandler({ path: graphqlPath }));

module.exports = router(get('/', function (req, res) {
  return 'Welcome!';
}), options(graphqlPath, graphqlHandler), post(graphqlPath, graphqlHandler), get(graphqlPath, graphqlHandler));
//# sourceMappingURL=index.js.map