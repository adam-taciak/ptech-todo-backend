const express = require('express')
const knex = require('knex')

const app = express()
const port = 3000

app.use(express.json())

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite',
  }
})

const init = async () => {
  console.log('creating table')
  const r = await db.schema.createTable('task', (table) => {
    table.increments()
    table.string('title')
    table.string('description')
    table.string('tenant')
  })

  console.log('createTable result', r)
}

app.get('/', (req, res) => {
  res.send('Hello world')
})


app.get('/task', async (req, res) => {
  const tenant = req.get('tenant')
  const tasks = await db.select('*').from('task').where('tenant', tenant)

  const response = tasks.map(task => {
    const { tenant, ...response } = task
    return response
  })

  res.json(response)
})

app.get('/task/:id', async (req, res) => {
  const id = req.params.id
  const [task] = await db.select('*').from('task').where('id', id)

  if (!task) {
    res.status(404).json({ message: 'Not found' })
  }

  res.json(task)
})

app.post('/task', async (req, res) => {
  const tenant = req.get('tenant')
  const task = {
    title: req.body.title,
    description: req.body.description,
    tenant,
  }

  await db('task').insert(task);
  res.json(task)
})

app.delete('/task/:id', (req, res) => {
  const id = req.params.id
  res.send(`deleting task id=${id}`)
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

init()
