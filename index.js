const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const uuid = require('uuid')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: "*" }));

app.post('/api/users', (req, res) => {
  const username = req.body.username
  console.log(username)
  const identifier = uuid.v5.URL
  console.log(identifier)
  return res.json({
    username,
    id: identifier,
  })
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
