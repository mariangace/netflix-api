const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const { Schema } = mongoose; //Grab the schema from mongoose
var cors = require('cors');
require('dotenv').config()


mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kvegb.mongodb.net/netflix-api-db-dev?retryWrites=true&w=majority`, 
{ useCreateIndex: true, 
  useUnifiedTopology: true, 
  useNewUrlParser: true});

const User = mongoose.model('Users', new Schema({
    name: String,
    email: { type: String,
        required: true,
        unique: true },
    password: {type: String, required:true}
  }));

app.use(cors());

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    next();
})

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World Mar!')
})

app.post('/register', (req, res) => {
    const newUser = new User({
        name:req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    newUser.save((err, user)=>{
        console.log("all is user")
        console.log(user)
        if(err){
            res.status(400).send({
                status: err
            })
        }
        res.status(200).send("registered");
    })
})

app.post('/login', (req, res) => {
    const { password, email}  = req.body; 
    console.log(req.body)
    User.findOne({ email, password }, (err, user) => {
        if(user){
            res.status(200).send({
                status: "valid"
            }) 
        }else{
           
            res.status(400).send({
                status:"Not Found"
            })
        }

    })
    
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
