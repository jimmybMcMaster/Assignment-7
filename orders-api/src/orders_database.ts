import { type Collection, type Db, ObjectId } from 'mongodb'
import { client } from '../database_access'
import { type Order, type OrderId, type BookID } from '../src/documented_types'

interface OrderRecord {
  books: Record<BookID, number>
}

export interface OrdersDatabaseAccessor {
  database: Db
  orders: Collection<OrderRecord>
}

export interface OrdersData {
  placeOrder: (books: Record<BookID, number>) => Promise<OrderId>
  listOrders: () => Promise<Order[]>
  fulfilOrder: (orderId: OrderId, books: Array<{ book: BookID, shelf: string, numberOfBooks: number }>) => Promise<void>
}

export interface AppOrdersDatabaseState {
  orders: OrdersData
}

export async function getOrdersDatabase (dbName?: string): Promise<OrdersDatabaseAccessor> {
  const database = client.db(dbName ?? Math.floor(Math.random() * 100000).toString())
  const orders = database.collection<OrderRecord>('orders')
  return { database, orders }
}

export class DatabaseOrders implements OrdersData {
  accessor: OrdersDatabaseAccessor

  constructor (accessor: OrdersDatabaseAccessor) {
    this.accessor = accessor
  }

  async placeOrder (books: Record<BookID, number>): Promise<OrderId> {
    const result = await this.accessor.orders.insertOne({ books })
    return result.insertedId.toHexString()
  }

  async listOrders (): Promise<Order[]> {
    const results = await this.accessor.orders.find().toArray()
    return results.map((doc) => ({
      orderId: doc._id.toHexString(),
      books: doc.books
    }))
  }

  async fulfilOrder (orderId: OrderId, _booksFulfilled: Array<{ book: BookID, shelf: string, numberOfBooks: number }>): Promise<void> {
    await this.accessor.orders.deleteOne({ _id: new ObjectId(orderId) })
  }
}

export async function getDefaultOrdersDatabase (name?: string): Promise<OrdersData> {
  const db = await getOrdersDatabase(name)
  return new DatabaseOrders(db)
}
