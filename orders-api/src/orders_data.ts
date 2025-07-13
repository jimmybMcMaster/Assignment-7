import { type BookID, type OrderId, type ShelfId } from './documented_types'

export interface OrdersData {
  getOrder: (orderId: OrderId) => Promise<Record<BookID, number> | false>
  removeOrder: (orderId: OrderId) => Promise<void>
  listOrders: () => Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>>
  placeOrder: (books: Record<BookID, number>) => Promise<OrderId>
  getCopiesOnShelf: (book: BookID, shelf: ShelfId) => Promise<number>
  placeBookOnShelf: (book: BookID, shelf: ShelfId, count: number) => Promise<void>
}

export class InMemoryOrders implements OrdersData {
  private readonly orders = new Map<OrderId, Record<BookID, number>>()
  private readonly books = new Map<BookID, Map<ShelfId, number>>()
  private currentId = 1

  constructor (seed?: {
    orders?: Record<OrderId, Record<BookID, number>>
    books?: Record<BookID, Record<ShelfId, number>>
  }) {
    if ((seed?.orders) != null) {
      for (const [orderId, books] of Object.entries(seed.orders)) {
        this.orders.set(orderId, books)
      }
      this.currentId = Object.keys(seed.orders).length + 1
    }

    if ((seed?.books) != null) {
      for (const [book, shelves] of Object.entries(seed.books)) {
        const shelfMap = new Map<ShelfId, number>()
        for (const [shelf, count] of Object.entries(shelves)) {
          shelfMap.set(shelf, count)
        }
        this.books.set(book, shelfMap)
      }
    }
  }

  async getOrder (orderId: OrderId): Promise<Record<BookID, number> | false> {
    return this.orders.get(orderId) ?? false
  }

  async removeOrder (orderId: OrderId): Promise<void> {
    this.orders.delete(orderId)
  }

  async listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
    return Array.from(this.orders.entries()).map(([orderId, books]) => ({ orderId, books }))
  }

  async placeOrder (books: Record<BookID, number>): Promise<OrderId> {
    const orderId = `order_${this.currentId++}`
    this.orders.set(orderId, books)
    return orderId
  }

  async getCopiesOnShelf (book: BookID, shelf: ShelfId): Promise<number> {
    return this.books.get(book)?.get(shelf) ?? 0
  }

  async placeBookOnShelf (book: BookID, shelf: ShelfId, count: number): Promise<void> {
    if (!this.books.has(book)) {
      this.books.set(book, new Map())
    }
    this.books.get(book)?.set(shelf, count)
  }
}
