'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var crypto = require('crypto');
var host = exports.host = 'localhost';
var database = exports.database = 'users';
var port = exports.port = '27017';
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
// export const secret = crypto.randomBytes(32).toString('hex')
var secret = exports.secret = '2f5e32861406fe147eb4ce29876767c9a948e93e4242e49d3c31f7258942472d';
var expiresIn = exports.expiresIn = 3600;
var AdminUsersCount = exports.AdminUsersCount = 2;
var emailAccount = exports.emailAccount = 'wsj-88488111@163.com';
var emailPassword = exports.emailPassword = 'wsj3120682';
//# sourceMappingURL=settings.js.map