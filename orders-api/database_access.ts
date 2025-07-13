import { MongoClient } from 'mongodb'

const uri = (global as any).MONGO_URI as string ?? 'mongodb://mongo'

export const client = new MongoClient(uri)
