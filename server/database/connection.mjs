
// Mongo initial config
const { MongoClient } = require('mongodb')
const connecionString = process.env.DB_URL || "";
const client = new MongoClient(connecionString)

// Mongo connection health check
let connection;
try {
    connection = client.connect();
}
catch(error){
    console.log("Connection failed, check errors: ", error)
}

// Database initialization
let database = connection.db("exercisetracker");
export default database;

