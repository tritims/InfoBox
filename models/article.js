let mongoose = require('mongoose');

//Create a schema
let articlSchema = mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  author: {
    type: String,
    required: false
  },
  body: {
    type: String,
    required: false
  }
});

let Article = module.exports = mongoose.model('Article', articlSchema);
