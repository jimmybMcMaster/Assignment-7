import amqplib from 'amqplib'

// amqplib npm docs boiler plate
export async function connectRabbitMQ (): Promise<void> {
  const queue = 'tasks'
  try {
    const conn = await amqplib.connect('amqp://localhost')

    const ch1 = await conn.createChannel()
    await ch1.assertQueue(queue)

    // Listener
    ch1.consume(queue, (msg: amqplib.Message | null) => {
      if (msg !== null) {
        console.log('Received:', msg.content.toString())
        ch1.ack(msg)
      } else {
        console.log('Consumer cancelled by server')
      }
    })

    // Sender
    const ch2 = await conn.createChannel()

    setInterval(() => {
      ch2.sendToQueue(queue, Buffer.from('something to do'))
    }, 1000)

    console.log('RabbitMQ connected')
  } catch (err) {
    console.error(err)
  }
}
