const express = require('express')
const cors = require('cors')
require('dotenv').config()
const uuid = require('uuid')
const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb')

// MongoDB config
const client = new MongoClient(process.env.DB_URL);
const database = client.db('exercisetracker')

// Mongo collections
var users = database.collection('users')
var exercises = database.collection('exercises')
var logs = database.collection('logs')

// Init express
const app = express()

// Middlewares
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: "*" }));

// Static content endpoints
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Users endpoints
app.post('/api/users', async (req, res) => {
  const username = req.body.username
  console.log(username)
  let result = await users.insertOne({ username: username });
  return res.send(result).status(201);
})

app.get('/api/users', async (req, res) => {
  const result = await users.find().toArray();
  return res.send(result).status(200)
})

// Exersices endpoints

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body
  console.log(_id)
  const user = await users.findOne({_id: new ObjectId(_id)})
  if(!user){
    return res.json({
      error: "User does not exist"
    })
  }
  var exerciseDate;

  const userId = user._id
  const username = user.username
  

  if (date) {
    exerciseDate = new Date(date).toDateString()
  }
  else {
    exerciseDate = new Date().toDateString()
  }
  const exercise = {
    userId: _id,
    description,
    duration,
    date: exerciseDate,
  }

  await exercises.insertOne(exercise)

  let result = {
    username,
    description,
    duration,
    exerciseDate,
    userId
  }
  return res.send(result).status(201);
})

// Logs endpoints
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query
  const user = await users.findOne({_id: new ObjectId(_id)})
  if(!user){
    return res.json({error: 'User does not exist'})
  }
  const userId = user._id
  const username = user.username
  let query = { userId: _id}

  if(from || to) {
    query.date = {}
    if (from) query.date.$gte = new Date(from)
    if (to) query.date.$lte = new Date(to)
  }

  let exercisesQuery = await exercises.find(query)
  if(limit){
    exercisesQuery = await exercisesQuery.limit(parseInt(limit))
  }

  const logArray = await exercisesQuery.toArray()

  result = {
    username,
    count,
    _id: userId,
    log: logArray
  }

  return res.send(result).status(200)
})


// Listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
