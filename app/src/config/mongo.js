import { MongoClient } from 'mongodb'

const url = process.env.MONGO_URL || 'mongodb://mongo:27017'

export default async function mongo() {
  return await new Promise((resolve, reject) => {
    MongoClient.connect(url, (error, client) => {
      if (error) reject(error)
      else resolve(client)
    })
  })
}