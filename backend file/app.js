const express = require("express")
const path = require('path')
const app = express()
const cookieParser = require('cookie-parser')

const userRouter = require('./routes/userRoutes')
const viewRouter = require('./routes/viewRoutes')
const profileRouter = require('./routes/profileRoutes')
const quizRouter = require("./routes/quizRoutes")
const questionRouter = require("./routes/questionRoutes")
const quizAttemptRouter = require("./routes/quizAttemptRoutes")

app.use(express.static(path.join(__dirname, '')))
app.use(cookieParser())
app.use(express.json())
app.use('/api/v1/users',userRouter)
app.use('/api/v1/profile', profileRouter)
app.use('/api/v1/quiz', quizRouter)
app.use('/api/v1/questions', questionRouter)
app.use('/api/v1/attempt', quizAttemptRouter)
app.use('/', viewRouter)

module.exports = app