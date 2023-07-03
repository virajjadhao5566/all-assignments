const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
const adminAuthentication = (req,res,next)=>{
  let {username,password} = req.headers
  let admin = ADMINS.find(admin => admin.username === username && admin.password === password)
  if(admin){
    next()
  }else{
    res.status(404).send({message:"admin not found"})
  }
}
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  let details = req.body
  let admin = ADMINS.find(admin => admin.username === details.username && admin.password === details.password)
  if(admin){
    res.status(403).send({message:"Admin already exists"})
  }else{
    ADMINS.push(details)
    res.send({message:"Created the account"})
  }
});

app.post('/admin/login', adminAuthentication, (req, res) => {
  // logic to log in admin
  res.status(200).send("Login Succesfully")
});

app.post('/admin/courses', adminAuthentication ,(req, res) => {
  // logic to create a course
  let course = req.body
  course.id = COURSES.length+1
  COURSES.push(course)
  res.status(200).json({message:"course created",id:course.id})
});

app.put('/admin/courses/:courseId', adminAuthentication,(req, res) => {
  // logic to edit a course
  let updatedCourse = req.body
  let course = COURSES.find(course=>course.id === parseInt(req.params.courseId))
  if(course){
    Object.assign(course,updatedCourse)
    res.send({message:"Updated the course",id:course.id})
  }else{
    res.status(404).send("Course not found")
  }
});

app.get('/admin/courses', adminAuthentication,(req, res) => {
  // logic to get all courses
  res.send(COURSES)
});

// User routes
const userAuthentication = (req,res,next) =>{
  let {username,password} = req.headers
  let user = USERS.find(user=> user.username === username && user.password === password);
  if(user){
    req.user = user
    next()
  }else{
    res.status(403).send("User not found")
  }
}

app.post('/users/signup', (req, res) => {
  // logic to sign up user
  let {username,password} = req.body
  let check = USERS.find(user=>user.username === username && user.password === password)
  if(check){
    res.status(403).send({message:"User already exists"})
  }
  const user = {
    username:req.body.username,
    password:req.body.password,
    purchasedCourses:[]
  }
  USERS.push(user)
  res.json({message:"User created succesfully"})
});

app.post('/users/login', userAuthentication,(req, res) => {
  // logic to log in user
  res.send("LoggedIn Sucessfully")
});

app.get('/users/courses', userAuthentication,(req, res) => {
  // logic to list all courses
  let publishedCourses = COURSES.filter(course=> course.published)
  res.send({courses:publishedCourses})
});

app.post('/users/courses/:courseId', userAuthentication,(req, res) => {
  // logic to purchase a course
  let courseId = parseInt(req.params.courseId)
  let course = COURSES.find(course=>course.id === courseId && course.published)
  if(course){
    req.user.purchasedCourses.push(courseId)
    res.send({message:"Course purchased succesfully"})
  }
});

app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
  // logic to view purchased courses
  let purchasedCoursesIds = req.user.purchasedCourses
  let courses = []
  for(let i = 0;i<COURSES.length;i++){
    if(purchasedCoursesIds.indexOf(COURSES[i].id) !== -1){
      courses.push({courses:COURSES[i]})
    }
  }
  res.send({courses})
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
