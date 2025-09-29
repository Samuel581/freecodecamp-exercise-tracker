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

// exercises endpoints

app.post('/api/users/:_id/exercises', async (req, res) => {
  // Params
  const { _id } = req.params
  // Body fields
  const { description, duration, date } = req.body

  const user = await users.findOne({_id: new ObjectId(_id)})
  if(!user){
    return res.json({
      error: "User does not exist"
    })
  }
  
  // Parse inputs
  const durationAsNumber = Number(duration);
  if(!description || Number.isNaN(durationAsNumber)){
    return res.status(400).json({ error: "Invalid description or duration" });
  }

  // Date as date object
  const dateObject = date ? new Date(date) : new Date()
  if(isNaN(dateObject.getTime())){
    return res.status(400).json({ error: "Invalid date" });
  }

  const result = {
    _id: user._id.toString(),
    username: user.username,
    date: dateObject.toDateString(),
    duration: durationAsNumber,
    description: String(description)
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
