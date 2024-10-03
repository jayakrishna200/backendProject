let express = require('express')
let path = require('path')
let {open} = require('sqlite')
let sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

let db = null
let dbPath = path.join(__dirname, 'todoApplication.db')

let initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
initializeDBandServer()

//API-1
const hasPriorityAndStatus = requestQuery => {
  let {priority, status} = requestQuery
  return priority !== undefined && status !== undefined
}
const hasPriority = requestQuery => {
  let {priority} = requestQuery
  return priority !== undefined
}
const hasStatus = requestQuery => {
  let {status} = requestQuery
  return status !== undefined
}

app.get('/todos/', async (request, response) => {
  let {status, priority, search_q = ''} = request.query
  let getTodosQuery = null
  let data = null
  switch (true) {
    case hasPriorityAndStatus(request.query):
      getTodosQuery = `
    SELECT * FROM todo
    WHERE 
    todo LIKE "%${search_q}%" AND
    status LIKE "%${status}%" AND
    priority LIKE "%${priority}%";
    `
      break
    case hasPriority(request.query):
      getTodosQuery = `
    SELECT * FROM todo 
    WHERE 
    todo LIKE "%${search_q}%" AND
    priority LIKE "%${priority}%";
    
    `
      break
    case hasStatus(request.query):
      getTodosQuery = `
    SELECT * FROM todo 
    WHERE 
    todo LIKE "%${search_q}%" AND
    status LIKE "%${status}%";
    
    `
      break
    default:
      getTodosQuery = `
    
    SELECT * FROM todo
    WHERE 
    todo LIKE "%${search_q}%";
    
    `
  }
  data = await db.all(getTodosQuery)
  response.send(data)
})

// API-2
app.get('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let getTodoWithIdQuery = `
  SELECT * FROM todo
  WHERE id=${todoId};
  
  `
  let data = await db.get(getTodoWithIdQuery)
  response.send(data)
})
// API-3
app.post('/todos/', async (request, response) => {
  let todoDetails = request.body
  let {id, todo, priority, status} = todoDetails
  let postTodoQuery = `

  INSERT INTO todo(id,todo,priority,status) VALUES
  (${id},"${todo}","${priority}","${status}");

  `
  await db.run(postTodoQuery)
  response.send('Todo Successfully Added')
})
// API-4

app.put('/todos/:todoId/', async (request, response) => {
  let todoDetails = request.body
  let {status, priority, todo} = todoDetails
  let {todoId} = request.params
  let updateQuery = null
  let hasStatus = requestBody => {
    let {status} = requestBody
    return status !== undefined
  }
  let hasPriority = requestBody => {
    let {priority} = requestBody
    return priority !== undefined
  }
  let hasTodo = requestBody => {
    let {todo} = requestBody
    return todo !== undefined
  }
  switch (true) {
    case hasStatus(request.body):
      updateQuery = `
    UPDATE todo
    SET status="${status}"
    WHERE id=${todoId};
    `
      await db.run(updateQuery)
      response.send('Status Updated')
      break
    case hasPriority(request.body):
      updateQuery = `
      UPDATE todo
      SET priority="${priority}"
      WHERE id=${todoId};
      `
      await db.run(updateQuery)
      response.send('Priority Updated')
      break
    case hasTodo(request.body):
      updateQuery = `
    UPDATE todo
    SET todo="${todo}"
    WHERE id=${todoId};
    `
      await db.run(updateQuery)
      response.send('Todo Updated')
      break
    default:
      pass
  }
})

// API-5
app.delete('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let deleteQuery = `
  DELETE FROM todo
  WHERE id=${todoId};
  `
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})
// Export
module.exports = app
