module.exports = (app) => {
  var Users = require('./models/userInfo');
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;



  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    console.log('serializeUser', user);
    done(null, user.userId); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((id, done) => { // 매개변수 id는 req.session.passport.user에 저장된 값
    console.log('deserializeUser', id);
    Users.findOne({userId:id}, (err, results) => {
      if(err){
        console.log(err);
        done('There is no user.');
      }else{
        done(null, results);
      }
    });
  });

  passport.use(new LocalStrategy({
    session: true
  }, function(username, password, done) {
      Users.findOne({ userId: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));
  return passport;
};
