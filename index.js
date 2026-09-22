require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id'})
  }
  next(error)
}

app.use(express.json())
app.use(requestLogger)
app.use(express.static('dist'))

morgan.token('body', (req) => {return req.method === 'POST' ? JSON.stringify(req.body) : ''})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


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

app.get('/api/persons/:id', (request, response,next) => {
    Person.findById(request.params.id).then(person => {
      if (person){
        response.json(person)
      } else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request,response,next) => {
    Person.findByIdAndDelete(request.params.id)
    .then((result) =>{
      response.status(204).end()
    })
    .catch((error) => next(error))
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

app.put('/api/persons/:id',(request,response,next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id,person,{new:true})
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
