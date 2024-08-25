const util = require('util');

const print = (object) => {
    console.log(util.inspect(object, { depth: 5 })); 
}

module.exports = print;