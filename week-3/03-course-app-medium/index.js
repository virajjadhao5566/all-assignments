const express = require('express');
const fs = require('fs')
const jwt = require('jsonwebtoken');
const { send } = require('process');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

try{
  ADMINS = JSON.parse(fs.readFileSync('./data/admin.json','utf-8'))
  USERS = JSON.parse(fs.readFileSync('./data/user.json','utf-8'))
  COURSES = JSON.parse(fs.readFileSync('./data/courses.json','utf-8'))
}catch{
  ADMINS = []
  USERS = []
  COURSES = []
}

const SECRET = "vir@jtheGrEat"

const authJWT = (req,res,next) =>{
  let authHeader = req.headers.authorization
  if(authHeader){
    const token = authHeader.split(' ')[1]
    jwt.verify(token,SECRET,(err,user)=>{
      if(err){
        res.sendStatus(401)
      }
      req.user = user
      next()
    })
  }else{
    res.sendStatus(401)
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  let admin = req.body
  let Exists = ADMINS.find(a => a.username == admin.username && a.password == admin.password)
  if(Exists){
    res.status(403).send({message:"User already exists"})
  }else{
    ADMINS.push(admin)
    fs.writeFileSync('./data/admin.json',JSON.stringify(ADMINS))
    const payload = {username:admin.username,role:"admin"}
    const token = jwt.sign(payload,SECRET,{expiresIn:'1h'})
    res.send({message:"Admin created Succesfuly",token})
  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  let admin = req.headers
  let Exists = ADMINS.find(a => a.username === admin.username && a.password === admin.password)
  if(Exists){
    let payload = {username:admin.username,role:"admin"}
    const token = jwt.sign(payload,SECRET,{expiresIn:'1h'})
    res.send({message:"LoggedIn Succesfully",token})
  }else{
    res.send({message:"Admin not found"})
  }
});

app.post('/admin/courses', authJWT, (req, res) => {
  // logic to create a course
  let course = req.body
  course.id = COURSES.length+1
  COURSES.push(course)
  fs.writeFileSync('./data/courses.json',JSON.stringify(COURSES))
  res.send({message:"Course created successfully"})
});

app.put('/admin/courses/:courseId', authJWT,(req, res) => {
  // logic to edit a course
  let updatedCourse = req.body
  let course = COURSES.find(c=> c.id === parseInt(req.params.courseId))
  if(course){
    Object.assign(course,updatedCourse)
    fs.writeFileSync('./data/courses.json',JSON.stringify(COURSES))
    res.send({message:"Course Updated Succesfully"})
  }else{
    res.send({message:"Course not found"})
  }
});

app.get('/admin/courses', authJWT,(req, res) => {
  // logic to get all courses
  res.send({courses:COURSES})
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  let user = req.body
  let exists = USERS.find(u => u.username === user.username && u.password === user.password)
  if(exists){
    res.status(403).send({message:"User already exists"})
  }else{
    USERS.push(user)
    fs.writeFileSync('./data/user.json',JSON.stringify(USERS))
    const payload = {username:user.username,role:"user"}
    const token = jwt.sign(payload,SECRET,{expiresIn:'1h'})
    res.send({message:"User created succesfully",token})
  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  let user = req.headers
  let exists = USERS.find(u => u.username === user.username && u.password === user.password)
  if(exists){
    const payload = {username:user.username,role:"user"}
    const token = jwt.sign(payload,SECRET,{expiresIn:'1h'})
    res.send({message:"LoggedIN Successfully",token})
  }else{
    res.status(401).send({message:"User not found"})
  }
});

app.get('/users/courses', authJWT,(req, res) => {
  // logic to list all courses
  res.send({courses:COURSES})
});

app.post('/users/courses/:courseId', authJWT,(req, res) => {
  // logic to purchase a course
  let course = COURSES.find(c=>c.id === parseInt(req.params.courseId))
  if(course){
    let user = USERS.find(u=>u.username === req.user.username)
    if(user){
      if(!user.purchasedCourses){
        user.purchasedCourses = []
      }
      user.purchasedCourses.push(course)
      fs.writeFileSync('./data/user.json',JSON.stringify(USERS))
      res.send({message:"Course purchases succesfully"})
    }else{
      res.status(403).send({message:"User not found"})
    }
  }else{
    res.status(404).send("Course not found")
  }
});

app.get('/users/purchasedCourses', authJWT,(req, res) => {
  // logic to view purchased courses
  let user = USERS.find(u => u.username === req.user.username)
  if(user){
    console.log(user.purchasedCourses)
    res.send({courses: user.purchasedCourses || []})
  }else{
    res.send({message:"User not found"})
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
