import mongoose from 'mongoose'
import 'dotenv/config'

export async function connectDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tasknest'
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log(`[db] connected → ${mongoose.connection.name}`)
}
