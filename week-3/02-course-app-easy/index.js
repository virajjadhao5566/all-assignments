const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  let username = req.body.username;
  let password = req.body.password;
  ADMINS.push({username,password})
  res.status(200).send('Admin created Successfuly')
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  let username = req.headers.username
  let password = req.headers.password
  let flag = 0;
  for(let i = 0;i<ADMINS.length;i++){
    if(ADMINS[i].username === username && ADMINS[i].password === password){
      flag = 1;
    }
  }
  if(flag == 0){
    res.status(404).send("Invalid admin")
  }
  res.status(200).send("Login Succesfully")
});

app.post('/admin/courses', (req, res) => {
  // logic to create a course
  let username = req.headers.username
  let password = req.headers.password
  let flag = 0;
  for(let i = 0;i<ADMINS.length;i++){
    if(ADMINS[i].username === username && ADMINS[i].password === password){
      flag = 1;
    }
  }
  if(flag == 0){
    res.status(404).send("Invalid admin")
  }
  let course = {
    id:COURSES.length+1,
    title:req.body.title,
    description:req.body.description,
    price:req.body.price,
    imageLink:req.body.imageLink,
    published:req.body.published
  }
  COURSES.push(course)
  res.status(200).json({message:"course created",id:COURSES.length})
});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course
  let username = req.headers.username
  let password = req.headers.password
  let flag = 0;
  for(let i = 0;i<ADMINS.length;i++){
    if(ADMINS[i].username === username && ADMINS[i].password === password){
      flag = 1;
    }
  }
  if(flag === 0){
    res.status(404).send("Invalid admin")
  }
  let index = COURSES.findIndex(course => course.id === req.query.courseId)
  if(index === -1){
    res.status(404).send("Course not found")
  }
  res.status(200).send("Course updated Succesfully")
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
  let username = req.headers.username
  let password = req.headers.password
  let flag = 0;
  for(let i = 0;i<ADMINS.length;i++){
    if(ADMINS[i].username === username && ADMINS[i].password === password){
      flag = 1;
    }
  }
  if(flag === 0){
    res.status(404).send("Invalid admin")
  }
  res.send(COURSES)
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  let username = req.body.username
  let password = req.body.password
  USERS.push({username,password})
  res.send("user created succesfully")
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  let username = req.body.username
  let password = req.body.password
  let flag = 0
  for(let i = 0;i<USERS.length;i++){
    if(USERS[i].username === username && USERS[i].password === password){
      flag = 1;
    }
  }
  if(flag == 0){
    res.status(404).send("User not found")
  }else{
    res.send("LoggedIn Sucessfully")
  }
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
  let username = req.headers.username
  let password = req.headers.password
  let flag = 0;
  for(let i = 0;i<USERS.length;i++){
    if(USERS[i].username === username && USERS[i].password === password){
      flag = 1;
    }
  }
  if(flag === 0) res.status(404).send("User not found")
  res.send(COURSES)
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  let username = req.headers.username
  let password = req.headers.password
  let flag = 0;
  for(let i = 0;i<USERS.length;i++){
    if(USERS[i].username === username && USERS[i].password === password){
      flag = 1;
    }
  }
  if(flag === 0) res.status(404).send("User not found")
  
  let index = COURSES.findIndex(course => course.id === req.query.courseId)
  if(index === -1){
    res.status(404).send("Course not available")
  }
  COURSES[i].published = "YES"
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
  let username = req.headers.username
  let password = req.headers.password
  let flag = 0;
  for(let i = 0;i<USERS.length;i++){
    if(USERS[i].username === username && USERS[i].password === password){
      flag = 1;
    }
  }
  if(flag === 0) res.status(404).send("User not found")
  let ans = []
  for(let i = 0;i<USERS.length;i++){
    if(USERS[i].published === "YES"){
      ans.push(USERS[i]);
    }
  }
  res.send(ans)
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
