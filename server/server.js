const express = require('express')
const enforce = require('express-sslify');
require('dotenv').config()

const dbConnect = require('./config/dbconnect')
const initRoutes = require('./routes')

const cookieParser = require('cookie-parser')
const cors = require('cors')


const app = express()
// app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'PUT', 'GET', 'DELETE'],
    credentials: true

}))
const port = process.env.PORT || 8181
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

dbConnect()
initRoutes(app)

app.use('/', (req, res) => { res.send('Server on') })

app.listen(port, () => {
    console.log('Server running on port: ' + port)
})
