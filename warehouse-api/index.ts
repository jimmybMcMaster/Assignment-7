import server from './server'
import { connectRabbitMQ } from './rabbitmq'

async function startApp (): Promise<void> {
  try {
    await connectRabbitMQ()
    await server(3000)
    console.log('Server is running')
  } catch (err) {
    console.error('Startup failed:', err)
  }
}

startApp().catch((err) => {
  console.error('Error during startup:', err)
})
