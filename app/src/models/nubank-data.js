import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  id: String,
  data: mongoose.Schema.Types.Mixed
})

const model = mongoose.model('NubankData', schema)

export default model