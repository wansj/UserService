import { expiresIn, secret, AdminUsersCount, emailAccount, emailPassword } from './settings'
import { getUser, wrapError } from './utils'
import { Role } from './Role'
import { decryptPassword } from './utils'
import { RedisPubSub } from 'graphql-redis-subscriptions'
const { ValidationError, ForbiddenError, AuthenticationError } = require("apollo-server-errors")
const jwt = require('jsonwebtoken')
const pinyin = require("pinyin")
const mongoose = require('mongoose')
const UserSchema = mongoose.Schema({
  username: {type: String, unique: true, required: true},
  pinyin: {type: String, required: true},
  password: {
    type: String,
    required: true,
    min: [6, '密码不能少于6个字符'],
    max: [20, '密码不能超过20个字符'],
    validate: {
      validator: function(v) {
        return !/\W/g.test(v);
      },
      message: props => '密码只能是字母、数字或下划线!'
    }
  },
  department: {type: String, required: true},
  role: {type: String, required: true},
  loged: {type: Boolean, required: true, default: false},
  avatar: String,
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v)
      },
      message: props => `${props.value}不是正确的电子邮件格式`
    }
  }
})
let User = null
try {
  User = mongoose.model('User', UserSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    User = mongoose.model('User')
  }
}
const pubsub = new RedisPubSub()
const registerLogOutListener = (token) => {
  const timer = setTimeout(() => {
    const decoded = jwt.decode(token)
    User.findByIdAndUpdate(decoded.userId, {loged: false}).exec()
    clearTimeout(timer)
    console.log('登陆过期，已自动退出登陆')
    pubsub.publish('tokenExpired', {tokenExpired: token})
  }, expiresIn * 1000)
}
const exceedAdminCount = async () => {
  const { Role } = require('./Role')
  const roles = await Role.find({ isAdmin: true }).exec()
  const ids = roles.map(role => role.id)
  const adminCount = await User.count({ role: { $in: ids } }).exec()
  return adminCount >= AdminUsersCount
}
const translate = (username) => {
  const array = pinyin(username, {style: pinyin.STYLE_NORMAL})
  return array.reduce((memo, char) => {
    memo = memo.push(...char)
    return memo
  }, []).join('')
}
const generateUserModel = (token) => ({
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
  signUp: ({ password, ...rest }) => {
    return new Promise(async (resolve, reject) => {
      try {
        // const { Role } = require('./Role')
        // const roles = await Role.find({ isAdmin: true }).exec()
        // const ids = roles.map(role => role.id)
        // const adminCount = await User.count({ role: { $in: ids } }).exec()
        if (exceedAdminCount() && rest.isAdmin) throw new ForbiddenError('管理员账户已达到最大数量')
        const uncrypted = decryptPassword(password)
        const translation = translate(rest.username)
        const doc = await new User({ ...rest, pinyin: translation, password: uncrypted, loged: true }).save()
        jwt.sign({ userId: doc._id }, secret, { expiresIn }, function (err, signature) {
          if (err) throw err
          else {
            registerLogOutListener(signature)
            resolve({ token: signature, user: doc })
          }
        })
      } catch (e) {
        if(e.message.indexOf('duplicate key error') > -1) reject(new ValidationError('用户名或电子邮件已经被使用'))
        reject(wrapError(e))
      }
    })
  },
  delete: ({ userId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const user = await getUser(token)
        const { Role } = require('./Role')
        const role = await Role.findById(user.role).exec()
        if (!role.isAdmin) throw new ForbiddenError('无权删除用户')
        await User.findByIdAndDelete(userId).exec()
        resolve(true)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  // username,password,department可以由用户自己更改，role只有管理员才能改，管理员可以修改所有人的信息，所以userId可以和当前登陆用户的id不一样
  update: ({ userId, ...rest }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const logedUser = await getUser(token)
        const { Role } = require('./Role')
        const role = await Role.findById(logedUser.role).exec()
        if (!role.isAdmin && rest.role) throw new ForbiddenError('只有管理员才可以指定角色')
        if (!role.isAdmin && userId !== logedUser.id) throw new ForbiddenError('不能修改别人的信息')
        if (rest.role) {
          const role2 = await Role.findById(rest.role).exec()
          if (role2.isAdmin && exceedAdminCount()) throw new ForbiddenError('管理员账户已达到最大数量')
        }
        const translation = rest.username ? {pinyin: translate(rest.username)} : {}
        const password = rest.password ? { password: decryptPassword(rest.password) } : {}
        const update = { ...rest, ...password, ...translation }
        const user = await User.findByIdAndUpdate(userId, update, { new: true }).exec()
        resolve(user)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  changePassword: ({ email, password }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findOneAndUpdate({email}, {password: decryptPassword(password)}, {new: true}).exec()
        resolve(user)
      } catch (e) {
        reject(wrapError(e))
      }
    })

  },
  logIn: ({ username, password }) => {
    return new Promise(async(resolve, reject) => {
      try {
        let doc = await User.findOne({ username }).exec()
        const uncrypted = decryptPassword(password)
        if (uncrypted !== doc.password) throw new ValidationError('密码错误')
        doc.loged = true
        doc = await doc.save()
        jwt.sign({ userId: doc._id }, secret, { expiresIn }, function (err, signature) {
          if (err) throw err
          else {
            registerLogOutListener(signature)
            resolve({ token: signature, user: doc })
          }
        })
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  logOut: () => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const user = await getUser(token)
        user.loged = false
        await user.save()
        resolve(true)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  listUsers: ({skip, limit}) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const user = await getUser(token)
        const _Role = require('./Role').Role
        const role = await _Role.findById(user.role).exec()
        if (!role.isAdmin) throw new ForbiddenError('无权限查看所有用户')
        else {
          let query = User.find({})
          if (typeof skip === 'number') query = query.skip(skip)
          if (typeof limit === 'number') query = query.limit(limit)
          resolve(await query.exec())
        }
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  getLogedUser: () => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        resolve(await getUser(token))
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  byId: ({ id }) => {
    return User.findById(id).exec()
  },
  byName: ({ username }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const user = await getUser(token)
        const _Role = require('./Role').Role
        const role = await _Role.findById(user.role).exec()
        if (!role.isAdmin) throw new ForbiddenError('没有权限')
        resolve(await User.findOne({username}).exec())
      } catch (e) {
        reject(e)
      }
    })
  },
  byNameOrEmail: ({ search }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const { userId } = jwt.verify(token, secret)
        // 首先使用facet查出当前登录用户和被检索的用户
        const result = await User.aggregate().facet({
          whose: [{
            $match: {
              $expr: {
                $eq: [userId, {$toString: '$_id'}]
              }
            }
          }],
          friend: [{
            $match: {
              $or: [{username: search}, {email: search}]
            }
          }]
        }).project({ // 用whose和friend来保存当前登录用户和被检索用户的_id，user保存被检索用户的全部字段
          whose: {$arrayElemAt: ['$whose._id', 0]},
          friend: {
            $cond: [{$gt: [{$size: '$friend'}, 0]}, {$arrayElemAt: ['$friend._id', 0]}, '']
          },
          user: {
            $cond: [{$gt: [{$size: '$friend'}, 0]}, {$arrayElemAt: ['$friend', 0]}, null]
          }
        }).lookup({ // 使用lookup的另一种语法，链接friends集合，查询当前登录用户和被检索用户之间是否存在朋友关系
          from: 'friends',
          let: {whoseId: '$whose', friendId: '$friend'},
          pipeline: [{
            $match: {
              $expr: {
                $or: [
                  {$and: [{$eq: ['$whose', '$$whoseId']}, {$eq: ['$friend', '$$friendId']}]},
                  {$and: [{$eq: ['$whose', '$$friendId']}, {$eq: ['$friend', '$$whoseId']}]},
                ]
              }
            }
          }],
          as: 'friendship'
          // 根据前面几步，friend字段直接返回被检索到的用户，如果没有检索到用户就返回null，status字段返回当前登录用户和被检索用户之间的朋友关系状态：
          // None代表没有朋友关系，或者返回查询到的friend的state字段，有2个可能的值：Unapproved代表等待验证，Approved代表已通过朋友验证
        }).project({
          friend: '$user',
          status: {
            $cond: [{$gt: [{$size: '$friendship'}, 0]}, {$arrayElemAt: ['$friendship.state', 0]}, 'None']
          }
        }).exec()
        // console.log(JSON.stringify(result))
        resolve(result[0])
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  getCaptcha: ({ email }) => {
    const nodemailer = require('nodemailer')
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({email}).exec()
      if (!user) reject(new ForbiddenError(`${email}不是密保邮箱，请输入注册用户时填写的邮箱`))
      const svgCaptcha = require('svg-captcha')
      const captcha = svgCaptcha.create()
      let transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        auth: {
          user: emailAccount,
          pass: emailPassword
        }
      })
      let mailOptions = {
        from: '"管理员" <wsj-88488111@163.com>',
        to: email,
        subject: '找回密码',
        text: captcha.text,
        html: `<div><h1>验证码为:</h1>${captcha.data}</div>`
      }
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(wrapError(error))
        }
        resolve(captcha.text)
      })
    })
  }
})
module.exports = { User, generateUserModel }
