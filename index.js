require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const { all } = require('express/lib/application')
const { json } = require('express/lib/response')
const { default: mongoose } = require('mongoose')
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

app.get('/api/persons/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date()}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
        .then(person => {
          if (person) {
            response.json(person)
          } else {
            response.status(404).end()
          }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
        .then(result => {
          response.status(204).end()
        })
        .catch(error => next(error))
})

// const validEntry = (name, number) => {
//   name = name.trim()
//   number = number.trim()
//   const allNames = persons.map(person => person.name)

//   return (name !== '' || name !== '') && !allNames.includes(name)
// }

app.post('/api/persons', (request, response) => {
  const body = request.body
  const name = body.name
  const number = body.number

  if (!name && !number) {
    return response.status(400).json({ error: 'name must be unique'})
  }

  const person = new Person({
    name: name,
    number: number
  })
  
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
          response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
