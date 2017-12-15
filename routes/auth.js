
module.exports = function(passport){
  //   var bkfd2Password = require("pbkdf2-password");
  // var hasher = bkfd2Password();
  var route = require('express').Router();
  route.post(
    '/login',
    passport.authenticate(
      'local',
      {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: false
      }
    )
  );

  route.post('/register', function(req, res){
      var user = {
        userId:'local:'+req.body.userId,
        password:req.body.password,
        userName:req.body.userName
      };
      var sql = 'INSERT INTO users SET ?';
      con.query(sql, user, function(err, results){
        if (err){
          console.log(err);
          res.satus(500);
        } else{
          req.login(user, function(err){
            req.session.save(function(){
              res.redirect('/');
        });
      });
    }});
    });
  });
  route.get('/register', function(req, res){
    res.render('register');
  });
  route.get('/login', function(req, res){
    res.render('auth/login');
  });
  route.get('/logout', function(req, res){
    req.logout();
    req.session.save(function(){
      res.redirect('/');
    });
  });
  return route;
}
