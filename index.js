const express = require('express')
const app = express()
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose; //Grab the schema from mongoose
var cors = require('cors');
require('dotenv').config();

const secreteToken = "d0d9fkdsldld";

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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * For now, our beautiful middleware :) 
 */
function authenticateToken(req,res,next){
    const authHeaderToken = req.headers['authorization']
    if(!authHeaderToken){
        return res.sendStatus(401)
    }
    jwt.verify(authHeaderToken, secreteToken, (err,user)=> {
        if(err){
            return res.sendStatus(403);
        }
        //console.log(user)
        next();
    })
}

app.get('/', (req, res) => {
  res.send('Hello World Mar!')
})

app.get('/whislist', authenticateToken, (req, res) => {
    res.send({
        //then we can get the wishlist based in user
        items:[
            "Budapest",
            "Advengers",
            "Tenet",
            "Queens Gambit"
        ]
    })
  })
  

app.post('/register', (req, res) => {
    const newUser = new User({
        name:req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    newUser.save((err, user)=>{
        //
        if(err){
            res.status(400).send({
                status: err
            })
        }else{
            console.log("all is good")
            console.log(user)
            //res.status(200).send("registered");
            res.status(200).send({
                status: "registered",
                token: user.id
            }) 
        }
        
    })
})

function generateAccessToken (user){
    const payload = {
        id:user.id,
        name:user.name
    }
    return jwt.sign(payload, "d0d9fkdsldld", { expiresIn: '7200s'});
}

app.post('/login', (req, res) => {
    const { password, email}  = req.body; 
    console.log(req.body)
    User.findOne({ email, password }, (err, user) => {
        if(user){
            console.log(user);
            const token = generateAccessToken(user);
            console.log(token);
            res.status(200).send({
                status: "valid",
                token: token
            }) 
        }else{
           
            res.status(400).send({
                status:"Not Found"
            })
        }

    })
    
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})
