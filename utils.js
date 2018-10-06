import { RedisPubSub } from 'graphql-redis-subscriptions'
import { secret } from './settings'
const { ApolloError } = require("apollo-server-errors")
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const ursa = require('ursa')
// 返回的是promise，调用的时候必须实用await
export const getUser = async (token) => {
  const { User } = require('./User')
  try {
    const { userId } = jwt.verify(token, secret)
    // User不能在最前面使用import导入，因为User.js里导入了util.js,util.js里也要导入User.js，这样会导致util.js导入User的时候
    // User还是undefined,所以要把User的导入放在函数里，这样才能确保导入User的时候User已经初始化了
    const user = await User.findOne({ _id: userId, loged: true }).exec()
    return user
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      const decoded = jwt.decode(token)
      User.findByIdAndUpdate(decoded.userId, {loged: false}).exec()
      console.log('登陆过期，已自动退出登陆')
      const pubsub = new RedisPubSub()
      pubsub.publish('tokenExpired', {tokenExpired: token})
    } else
      throw e
  }
}
export const getPublicKey = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '../rsa_1024_pub.pem'), (err, data) => {
      if (err)
        reject(err)
      else
        resolve(data)
    })
  })
}
export const decryptPassword = (password) => {
  const key = ursa.createPrivateKey(fs.readFileSync(path.join(__dirname, '../rsa_1024_priv.pem')))
  return key.decrypt(password, 'base64', 'utf8', ursa.RSA_PKCS1_PADDING)
}
export const wrapError = (err) => {
  if (err instanceof ApolloError) return err
  else return new ApolloError(err.message, err.name)
}