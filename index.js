require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


const app = express()

app.use(cors())
app.use(express.json())

morgan.token('body', (req) => {return req.method === 'POST' ? JSON.stringify(req.body) : ''})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/info', (request, response) => {
    Person.countDocuments().then(count => {
        response.send(`<p>Phonebook has info for ${count} people</p><p>${Date()}`) 
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      if (person){
        response.json(person)
      }
    else{
        response.status(404).end()
      }
    })
})

app.delete('/api/persons/:id', (request,response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request,response) => {
    const body = request.body

    if (!body.number || !body.name ) {
      return response.status(400).json({
        error: 'content missing',
      })
    }
    
    const person = new Person({
      name: body.name, 
      number: body.number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
})


const PORT = process.env.PORT || 3001

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
