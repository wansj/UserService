'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect('mongodb://' + _settings.host + ':' + _settings.port + '/' + _settings.database, { useNewUrlParser: true });

_mongoose2.default.Promise = global.Promise;
var db = _mongoose2.default.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('db is running on port: ' + _settings.port);
});
exports.default = db;
//# sourceMappingURL=db.js.map