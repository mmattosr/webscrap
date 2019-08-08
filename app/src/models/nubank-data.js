import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  limit: {
    total: String,
    available: String
  },
  lastTransaction: {
    time: String,
    title: String,
    amount: String
  },
  feed: [{
    kind: String,
    time: String,
    title: String,
    amount: String,
    description: String,
    tags: String
  }],
  bills: [{
    due: String,
    period: {
      start: String,
      end: String
    },
    amount: String,
    detail: String,
    charges: [{
      time: String,
      description: String,
      amount: String
    }]
  }]
})

const model = mongoose.model('NubankData', schema)

export default model