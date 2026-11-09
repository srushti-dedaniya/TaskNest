import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/database.js'
import User from '../models/User.js'

const [email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD, name = process.env.ADMIN_NAME || 'Administrator'] =
  process.argv.slice(2)

async function main() {
  if (!email || !password) {
    console.error('Usage: npm run create-admin [email] [password]  (or set ADMIN_EMAIL/ADMIN_PASSWORD in .env)')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('Admin password must be at least 8 characters')
    process.exit(1)
  }
  await connectDatabase()
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    if (exists.role !== 'admin') {
      exists.role = 'admin'
      await exists.save()
      console.log(`[create-admin] promoted existing user ${email} → admin`)
    } else {
      console.log(`[create-admin] admin already exists: ${email}`)
    }
  } else {
    await User.create({ name, email, password, role: 'admin' })
    console.log(`[create-admin] admin created: ${email}`)
  }
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('[create-admin] failed:', err.message)
  process.exit(1)
})
