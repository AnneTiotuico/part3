require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const { all } = require('express/lib/application')
const { json } = require('express/lib/response')
const app = express()

morgan.token('person', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.filter(person => person.id === id)[0]
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  return Math.floor(Math.random() * 1000)
}

const validEntry = (name, number) => {
  name = name.trim()
  number = number.trim()
  const allNames = persons.map(person => person.name)

  return (name !== '' || name !== '') && !allNames.includes(name)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  const name = body.name
  const number = body.number

  if (!validEntry(name, number)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    id: generateId(),
    name: name,
    number: number
  }

  persons = persons.concat(person)

  response.json(person)
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
