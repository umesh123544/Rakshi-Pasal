const express = require('express')
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express()
const port = 3000


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://umesh123:umesh123@aaila12.wxu3ntz.mongodb.net/?retryWrites=true&w=majority&appName=aaila12";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {[]
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    console.log("conneciton closed")
    await client.close();
  }
}
run().catch(console.dir);

const DB_URL="mongodb+srv://umesh123:umesh123@aaila12.wxu3ntz.mongodb.net/?retryWrites=true&w=majority&appName=aaila12"
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
app.post('/users-create', async (req, res) => {
  try {
    // Validate request body
    console.log(req.data)
    // console.log(req)
    const { name, email, age } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Create and save user
    const newUser = new User({ name, email, age });
    await newUser.save();

    // Respond with 201 (Created) and the new user
    res.status(201).json(newUser);
  } catch (err) {
    console.log(err)
    // Handle duplicate email or validation errors
    if (err.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});
app.get('/users', async (req, res) => {
  try {
    console.log(User)
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
app.get('/users/:id', async (req, res) => {
  try {
    console.log(User)
    console.log(req.params.id)
    const users = await User.findById(req.params.id);
    res.send(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});