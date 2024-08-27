// core module imports
const express = require('express');
const cors = require('cors');
const csrf = require('csrf');
const dotenv = require('dotenv');

// database connection import 
const connectToDatabase = require('./database/db');

// routes import
const revisionRoutes = require('./routes/revisionRoutes');
const studyRoutes = require('./routes/studyRoutes');

// middleware import
const authMiddleware = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 

// mandatory auth for all apis
app.use(authMiddleware);

// use all the routes defined
app.use('/revision', revisionRoutes);
app.use('/study', studyRoutes);

// Empty route
app.get('/', function (req, res) {
    res.send('Study Sync');
})

// Health check route to verify the server is running properly
app.get('/health', function (req, res) {
    res.send('Server is running');
})

// connect to the database and start the server
connectToDatabase()
    .then((result) => {
        console.log("Connected Successfully");
        // will do the server initialization here later...
        app.listen(process.env.PORT, () => {
            console.log('Server running on port ' + process.env.PORT);
        });
    })
    .catch((error) => {
        console.log(error);
    });
