import Task from '../models/Task.js'
import User from '../models/User.js'

export const taskService = {
  findAudienceInterns: async (mode, interns) => {
    if (mode === 'all') {
      return User.find({ role: 'intern' }).select('_id name email')
    }
    return User.find({ _id: { $in: interns }, role: 'intern' }).select('_id name email')
  },

  getInternTasks: async (internId, filter = {}) => {
    return Task.find({
      $or: [
        { 'assignment.mode': 'all' },
        { 'assignment.interns': internId }
      ],
      ...filter
    }).sort({ deadline: 1 })
  }
}

export default taskService

