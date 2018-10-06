import { getUser, wrapError } from './utils'
import { User } from './User'
import { AdminUsersCount } from './settings'
const mongoose = require('mongoose')
const { ForbiddenError, SyntaxError, AuthenticationError } = require("apollo-server-errors")
const RoleSchema = mongoose.Schema({
  name: {type: String, unique: true, required: true},
  description: String,
  isAdmin: {type: Boolean, default: false, required: true},
  maxBorrowDuration: {type: Number, default: 90, required: true},
  maxHoldCount: {type: Number, default: 5, required: true},
  maxDelayTimes: {type: Number, default: 1, required: true},
  maxDelayDays: {type: Number, default: 30, required: true}
})
let Role = null
try {
  Role = mongoose.model('Role', RoleSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Role = mongoose.model('Role')
  }
}

const generateRoleModel = (token) => ({
  byId: (id) => {
    return Role.findById(id).exec()
  },
  createRole: (args) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const user = await getUser(token)
        if(!user.role) throw new SyntaxError(`用户${user.username}角色未定义`)
        const role = await Role.findById(user.role).exec()
        if(!role.isAdmin) throw new ForbiddenError(`用户${user.username}无权限创建角色`)
        const doc = await new Role({ ...args }).save()
        resolve(doc)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  delete: ({ id }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const user = await getUser(token)
        if(!user.role) throw new SyntaxError(`用户${user.username}角色未定义`)
        const role = await Role.findById(user.role).exec()
        if (!role.isAdmin) throw new ForbiddenError(`用户${user.username}无权限删除角色`)
        const linkedUsers = await User.find({ role: id }).exec()
        if (linkedUsers.length > 0) {
          const usernames = linkedUsers.map(user => user.username).join('、')
          throw new ForbiddenError(`要删除的角色上已关联了用户，必须先为已关联用户后重新指定角色。关联的用户有：${usernames}`)
        }
        await Role.findByIdAndDelete(id).exec()
        resolve(true)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  update: ({ id, ...rest }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const user = await getUser(token)
        if(!user.role) throw new SyntaxError(`用户${user.username}角色未定义`)
        let role = await Role.findById(user.role).exec()
        if (!role.isAdmin) throw new ForbiddenError(`用户${user.username}无权限修改角色`)
        if (Object.keys(rest).length === 0) throw new ForbiddenError('要修改的内容不能为空')
        role = await Role.findByIdAndUpdate(id, rest, { new: true }).exec()
        resolve(role)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  listRoles: () => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) throw new AuthenticationError('用户未登陆')
        const user = await getUser(token)
        if(!user.role) throw new SyntaxError(`用户${user.username}角色未定义`)
        const role = await Role.findById(user.role).exec()
        if(!role.isAdmin) throw new ForbiddenError(`用户${user.username}无权限查看角色`)
        const roles = await Role.find({}).exec()
        resolve(roles)
      } catch (e) {
        reject(wrapError(e))
      }
    })
  },
  // 如果管理员账户数量已达到设置值，则关闭管理员账户注册功能，此方法将仅返回非管理员角色
  availableRoles: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const roles = await Role.find({isAdmin: true}).exec()
        const ids = roles.map(role => role.id)
        const { User } = require('./User')
        const count = await User.count({role: {$in: ids}}).exec()
        const query = count < AdminUsersCount ? {} : { isAdmin: false }
        resolve(await Role.find(query).exec())
      } catch (e) {
        reject(wrapError(e))
      }
    })
  }
})
module.exports = { Role, generateRoleModel }
