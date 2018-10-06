const crypto = require('crypto')
export const host = 'localhost'
export const database = 'users'
export const port = '27017'
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
// export const secret = crypto.randomBytes(32).toString('hex')
export const secret = '2f5e32861406fe147eb4ce29876767c9a948e93e4242e49d3c31f7258942472d'
export const expiresIn = 3600
export const AdminUsersCount = 2
export const emailAccount = 'wsj-88488111@163.com'
export const emailPassword = 'wsj3120682'