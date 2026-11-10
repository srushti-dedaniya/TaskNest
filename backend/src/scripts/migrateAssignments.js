import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/database.js'
import Task from '../models/Task.js'
import User from '../models/User.js'
import Submission from '../models/Submission.js'

export async function migrateAssignments() {
  await connectDatabase()
  const interns = await User.find({ role: 'intern' }).select('_id')
  const internIdSet = new Set(interns.map((i) => String(i._id)))
  const tasks = await Task.find({})
  let migratedCount = 0

  for (const task of tasks) {
    let changed = false
    task.assignment = task.assignment || { mode: 'all', interns: [] }

    if (task.assignment.mode === 'all') {
      const existingMap = new Map((task.assignments || []).map((a) => [String(a.intern), a.status]))
      const newAssignments = interns.map((u) => ({
        intern: u._id,
        status: existingMap.get(String(u._id)) || 'assigned',
      }))
      task.assignments = newAssignments
      task.assignment.interns = interns.map((u) => u._id)
      changed = true
    } else {
      // Individual mode: deduplicate and validate
      const rawIds = (task.assignment.interns || []).map(String).filter((id) => mongoose.isValidObjectId(id) && internIdSet.has(id))
      const uniqueIds = [...new Set(rawIds)]
      task.assignment.interns = uniqueIds.map((id) => new mongoose.Types.ObjectId(id))

      const existingMap = new Map((task.assignments || []).map((a) => [String(a.intern), a.status]))
      task.assignments = uniqueIds.map((id) => ({
        intern: new mongoose.Types.ObjectId(id),
        status: existingMap.get(id) || 'assigned',
      }))
      changed = true
    }

    // Sync statuses from existing submissions
    const submissions = await Submission.find({ task: task._id })
    for (const sub of submissions) {
      const match = task.assignments.find((a) => String(a.intern) === String(sub.intern))
      if (match) {
        if (sub.status === 'approved') match.status = 'completed'
        else if (sub.status === 'submitted' || sub.status === 'under_review') match.status = 'submitted'
        changed = true
      }
    }

    if (changed) {
      await task.save()
      migratedCount++
    }
  }

  console.log(`[migration] Successfully normalized assignments for ${migratedCount} tasks.`)
  return migratedCount
}

const isDirectRun = process.argv[1]?.includes('migrateAssignments.js')
if (isDirectRun) {
  migrateAssignments().then(() => process.exit(0)).catch((err) => {
    console.error('[migration:error]', err)
    process.exit(1)
  })
}

