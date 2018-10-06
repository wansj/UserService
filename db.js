import mongoose from 'mongoose'
import { host, port, database } from './settings'
mongoose.connect(`mongodb://${host}:${port}/${database}`, { useNewUrlParser: true })

mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log(`db is running on port: ${port}`)
})
export default db