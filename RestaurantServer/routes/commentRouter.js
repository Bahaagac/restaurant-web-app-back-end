const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Comments = require('../models/comments');

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());



//Comments
commentRouter.route('/')

.get((req,res,next) => {
    Comments.find(req.query)
    .populate('author')
    .then((comments) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(comments); 
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    if(req.body != null) {
        req.body.author = req.user._id
        Comments.create(req.body)
        .then((comment) => {
                Comments.findById(comment._id)
                .populate('author')
                .then((comment) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                })
        
        }, (err) =>next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Comment not found in request body');
        err.status = 404;
        console.log(err,"deneme2");
        return next(err);
    }
    
})

.put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Comments.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);         
    }, (err) => next(err))
    .catch((err) => next(err));    
});


// comments/commendId
commentRouter.route('/:commentId')
.options((req,res) => {res.sendStatus(200); })

.get((req,res,next) => {
    console.log(req.user)

    Comments.findById(req.params.commentId)
    .populate('author')    
    .then((comment) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
         res.json(comment);
        
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /commments/'+ req.params.commentId);
})

.put(authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null) {
            if(comments.author.equals(req.user._id)) {
                Comments.findByIdAndUpdate(req.params.commentId, 
                {$set: req.body}, 
                {new : true})
                .then((comment) => {
                    Comments.findById(comment._id)
                    .populate('author')
                    .then((comment) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(comment);  
                    })              
                }, (err) => next(err));
            }
            else {
                var err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                next(err);
            }            
            
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser,  (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (comment != null) {
            if(comment.author.equals(req.user._id)) {
                Comments.findByIdAndRemove(req.params.commentId)
                .then((resp ) => {                   
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);                                   
                }, (err) => next(err));
            }
            else {
                var err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                next(err);
            }
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = commentRouter;