var express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const passport = require('passport');
const authenticate  = require('../authenticate');


var router = express.Router();
router.use(bodyParser.json());


router.get(('/'),authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
  console.log(req.user)
  User.find({})
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
})


router.post('/signup',(req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json(err);
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json(err);
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});
  
router.post('/login',(req,res ,next ) => {

  passport.authenticate('local', (err,user,info) => {
    if(err) {
      return next(err);
    }
    if(!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type','application/json');
      res.json({success: false,status: 'Login Unsuccesful',err:info}); 
    }
    else
    {
      req.logIn(user, (err)=> {
      if(err) {
        res.statusCode = 401;
        res.setHeader('Content-Type','application/json');
        res.json({success: false,status: 'Login Unsuccesful',err:'Could not log in user!'}); 
      }
      const token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json({success: true, token: token,status: 'Login Succesful', token : token});  
      })}
    }) (req,res,next);
     
})

router.get('/logout', (req, res,next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

router.get('/checkJWTToken',(req,res) => {
  passport.authenticate('jwt',{session : false}, (err,user,info) => {
    if(err) {
      return next(err);
    }
    if(!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type','application/json');
      return res.json({status:'JWT invalid',success: false,err:info})
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      return res.json({status:'JWT valid',success: true,user:info})
    }
  }) (req,res);
})
module.exports = router;
