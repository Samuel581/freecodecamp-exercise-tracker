const express = require('express')
const cors = require('cors')
require('dotenv').config()
const uuid = require('uuid')
const { MongoClient } = require('mongodb')

// MongoDB config
const client = new MongoClient(process.env.DB_URL);
const database = client.db('exercisetracker')

// Mongo collections
var users = database.collection('users')
var exercises = database.collection('exercises')
var logs = database.collection('logs')

const app = express()
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: "*" }));

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


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
