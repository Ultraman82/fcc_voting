require('dotenv').config()
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var Users = require('./models/userInfo');
var Polls = require('./models/polls');
var app = express();
var passport = require('./passport.js')(app);
app.use(express.static('public'));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
   secret: 'foo',
   resave: false,
   saveUninitialized: true,
   store:  new MongoStore({
      url : MONGODB_URI
    })
}));
app.use(session({ secret: 'foo', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// mongoose.connect('mongodb://127.0.0.1:27017/local');
mongoose.connect(process.env.MONGODB_URI);

app.set('view engine', 'jade');
app.set('views', './views');

app.get('/',function (req,res){
  Polls.find({}, (err,data)=>{
if(req.user){
      res.render('index', {data:data, user:req.user});
}else{
  res.render('index', {data:data});
}
    }).sort(-'votes').limit(3);
 });
app.post(
  '/login',
  passport.authenticate(
    'local',
    {
      successRedirect: '/',
      failureRedirect: '/fail',
      failureFlash: false
    }
  )
);

app.get('/allPolls',function (req,res){
  Polls.find({}, (err,data)=>{
    if(req.user){
      res.render('allPolls', {data:data, user:req.user});
      console.log(data);
    }else{
      res.render('allPolls', {data:data});
      console.log(data);
    }
  });
 });


app.get('/vote/:title',function (req,res){
  var title = req.params.title;
  Polls.findOne({pollTitle:title}, (err,data)=>{
    res.render('vote', {data:data});
    });
  });

app.get('/edit/:title',function (req,res){
  var title = req.params.title;
  Polls.findOne({pollTitle:title}, (err,data)=>{
    res.render('edit', {data:data});
    });
  });

app.post('/edit/:title', function (req,res){
  var title = req.params.title;
  var newOptions = {};
  Polls.findOne({pollTitle:title}, (err,data)=>{
    if (err){
    res.send('Error Saving to database');}
    for (option in data.options){
      newOptions[req.body[option]] = data.options[option];
      }
    Polls.update({pollTitle:title}, {$set: {options:newOptions}}, (err,data)=>{
      if (err){
        res.send('Error Saving to database');
        }
    });
    res.redirect('/mypolls');
  });
});

app.get('/delete/:title',function (req,res){
  var title = req.params.title;
  Polls.findOne({pollTitle:title}, (err,data)=>{
    res.render('delete', {data:data});
    });
  });
app.post('/delete/:title',function (req,res){
  var title = req.params.title;
  Polls.remove({pollTitle:title}, (err,data)=>{
    console.log('Collection removed');
    res.redirect('/mypolls');
    });
  });



app.post('/vote/:title', function (req,res){
  var title = req.params.title
  var inc = {$inc: {votes:1}};
  inc.$inc["options." + req.body.option] = 1;
  Polls.findOneAndUpdate({pollTitle:title}, inc, (err,data)=>{
    if (err){
    res.send('Error Saving to database');    }
  });
  res.redirect('back');
});


app.post('/register', function (req,res){
  var user = new Users({
    userId: req.body.userId,
    password: req.body.password,
    userName: req.body.userName
  });
  user.save(err =>{
    if (err){
      res.send('Error Saving to database');
    }
  });
  res.redirect('/');
});


app.get('/login', function(req, res){
  res.render('login');
});
app.get('/addpoll', function(req, res){
  res.render('addPoll',  {user:req.user});
});

app.get('/logout', function(req, res){
  req.logout();
  req.session.save(function(){
    res.redirect('/');
  });
});

app.get('/register',function (req,res){
 res.render('register');
});

app.get('/mypolls',function (req,res){
  Polls.find({userId:req.user.userId}, (err,data)=>{
      res.render('mypolls', {data:data, user:req.user});
    }).sort(-'votes').limit(10);
    // res.render('mypolls', {user:req.user});
  });

app.post('/addpoll', function (req,res){
  var options = {};
  for (var i= 0; 1 ;i++){
    var kk = eval(`req.body.option${i}`);
    if (kk === undefined){
      var data = new Polls({
        userId: req.user.userId,
        pollTitle: req.body.pollTitle,
        options: options
      });
      data.save(err =>{
        if (err){
          res.send('Error Saving to database');
        }
    });
    return res.redirect('/');
    }else{
      options[kk] = 0;
   }
  }
});

app.post('/register', function (req,res){
  var data = new Users({
    userId: req.body.userId,
    password: req.body.password,
    userName: req.body.userName
  });
  data.save(err =>{
    if (err){
      res.send('Error Saving to database');
    }
  });
  res.redirect('/');
});


app.listen(3000, function(){
  console.log('Connected, 3000 port!');
});
