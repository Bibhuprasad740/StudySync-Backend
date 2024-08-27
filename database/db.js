const mongoose = require('mongoose');

const connectToDatabase = () => {
    return mongoose.connect(process.env.MONGO_URL);
}

module.exports = connectToDatabase;