import mongoose from 'mongoose'

class Database {
  constructor() {
    try {
      mongoose.connect(process.env.MONGO_URL || 'mongodb://mongo:27017')
      console.log('Database connected')
    } catch (e) {
      console.error('Database connection error', error)
    }
  }
}

export default new Database()
