const express = require('express');
const router = express.Router();

//Bring in the model
let Article = require('../models/article');

//Add Route
router.get('/add',function(req,res){
  res.render('add_article',{
    title: 'Add article'
  })
});

//Edit Route
router.get('/edit/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article',{
      title: 'Edit Article',
      article: article
    });
  });
});

//Add submit post Route
router.post('/add', function(req, res){
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
router.post('/edit/:id', function(req, res){
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
});

//Delete Route
router.delete('/:id', function(req, res){
  let query = {_id: req.params.id};
  Article.remove(query, function(err){
    if(err){
      console.log(err);
    }
    req.flash('success','Article Deleted');
    res.send('Success');
  })
});

//Get single article
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('article', {
      article: article
    })
  })
});


module.exports = router;
