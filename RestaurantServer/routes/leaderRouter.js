const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Leaders = require('../models/leaders');


const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());


//Leaders
leaderRouter.route('/')

.get((req,res,next) => {
    Leaders.find(req.query)
    .then((leaders) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }),(err) => next(err)
    .catch((err) => next(err))  
})

.post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Leaders.create(req.body)
    .then((leader) => {
        res.statusCode =200;
        res.setHeader('Content-Type','appliation/json');
        res.json(leader)
    }), (err) => next(err)
    .catch((err) => next(err))
})

.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;
    res.end('Put operation not supported for /leaders');
})

.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Leaders.remove({})
    .then((leaders) =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }),(err) => next(err)
    .catch((err) => next(err))
});

//LeaderId

leaderRouter.route('/:leaderId')

.get((req,res,next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(leader)
    }),(err) => next(err)
    .catch((err) => next(err))
})

.post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;
    res.send('This operation not supported on /leaders/' + req.params.leaderId)
})

.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId,
        {$set : req.body},
        {new : true})
    .then((leader) => {
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    }), (err) => next(err)
    .catch((err) => next(err))
})

.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((leader) => {
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    }),(err) => next(err)
    .catch((err) => next(err))
});

module.exports = leaderRouter;