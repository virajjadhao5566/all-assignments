const express = require('express');
const jwt = require('jsonwebtoken')
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secretKey = "V1r@7encryp7ed"
// Admin routes
let generateJwt = (admin) =>{
  let payload = {username:admin.username}
  return jwt.sign(payload,secretKey,{expiresIn:'1h'})
}

let authenticateJwt = (req,res,next) =>{
  let authHeader = req.headers.authorization
  if(authHeader){
    let token = authHeader.split(' ')[1];

    jwt.verify(token,secretKey,(err,user)=>{
      if(err){
        return res.sendStatus(403)
      }
      req.user = user
      next()
    })
  }else{
    res.send(401)
  }
}

app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body
  let isExists = ADMINS.find(a => a.username === admin.username)
  if(isExists){
    res.status(403).send("Already exists")
  }else{
    ADMINS.push(admin)
    let token = generateJwt(admin)
    res.send({message:"Account Created",token:token})
  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  let {username,password} = req.headers
  let admin = ADMINS.find(admin=> admin.username === username && admin.password === password)
  if(admin){
    const token = generateJwt(admin)
    res.json({message:"LoggedIn succesfully",token})
  }else{
    res.status(404).send("admin not found")
  }
});

app.post('/admin/courses',authenticateJwt,(req, res) => {
  // logic to create a course
  let course = req.body
  course.id = COURSES.length+1
  COURSES.push(course)
  res.send({message:"Course created succesfully",id:course.id})
});

app.put('/admin/courses/:courseId', authenticateJwt, (req, res) => {
  const courseId = parseInt(req.params.courseId);

  const courseIndex = COURSES.findIndex(c => c.id === courseId);

  if (courseIndex > -1) {
    const updatedCourse = { ...COURSES[courseIndex], ...req.body };
    COURSES[courseIndex] = updatedCourse;
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/admin/courses', authenticateJwt ,(req, res) => {
  // logic to get all courses
  res.send({courses:COURSES})
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  let user = req.body;
  let isExists = USERS.find(u => u.username === user.username)
  if(isExists){
    res.send({message:"User already exists"})
  }else{
    USERS.push(user)
    let token = generateJwt(user)
    res.send({message:"SignedIn successfully",token})
  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  const {username,password} = req.headers
  let user = USERS.find(user=> user.username === username && user.password === password)
  if(user){
    let token = generateJwt(user)
    res.send({message:"LoggedIn Successfully"})
  }else{
    res.status(403).send("user not found")
  }
});

app.get('/users/courses', authenticateJwt,(req, res) => {
  // logic to list all courses
  let publishedCourses = COURSES.filter(course=>course.published)
  res.send(publishedCourses)
});

app.post('/users/courses/:courseId', authenticateJwt, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    const user = USERS.find(u => u.username === req.user.username);
    if (user) {
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json({ message: 'Course purchased successfully' });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/users/purchasedCourses', authenticateJwt, (req, res) => {
  const user = USERS.find(u => u.username === req.user.username);
  if (user && user.purchasedCourses) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: 'No courses purchased' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
