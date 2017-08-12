const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

//Check connection
db.once('open', function(){
  console.log('Connected to mongodb...');
})

//Check for database connection errors
db.on('error', function(err){
  console.log(err);
})

//App init
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Set public as static folder
app.use(express.static(path.join(__dirname, 'public')));

//Express sessio middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express meaages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Bring in the models
let Article = require('./models/article');

//Init route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    }
    else{
      res.render('index',{
        'title': 'Articles',
        articles: articles
      });
    }

  });
})

//Get single article
app.get('/article/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('article', {
      article: article
    })
  })
})

//Add Route
app.get('/articles/add',function(req,res){
  res.render('add_article',{
    title: 'Add article'
  })
})

//Edit Route
app.get('/article/edit/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article',{
      title: 'Edit Article',
      article: article
    });
  });
})

//Add submit post Route
app.post('/articles/add', function(req, res){
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article',{
      errors: errors,
      title: 'Add article'
    })
  }
  else{
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
      }else{
        req.flash('success','Articles added');
        res.redirect('/');
      }
    });
  }
});

//Edit submit post route
app.post('/articles/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id: req.params.id};

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
    }else{
      req.flash('success','Article updated');
      res.redirect('/');
    }
  })
})

//Delete Route
app.delete('/article/:id', function(req, res){
  let query = {_id: req.params.id};
  Article.remove(query, function(err){
    if(err){
      console.log(err);
    }
    res.send('Success');
  })
})

//Start server
app.listen(3000, function(){
  console.log("server started at port 3000....");
});
