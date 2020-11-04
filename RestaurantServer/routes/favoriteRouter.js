const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');

const favRouter = express.Router();

favRouter.use(bodyParser.json());

favRouter.route('/')

.get(authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({ user: req.user._id})
    .populate('user')
    .populate('dishes')
    .exec((err,favorites) => {
        res.statusCode = 200;
        if(err) return next(err);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    });
})
.post(authenticate.verifyUser, (req,res,next) =>{
   
        Favorites.findOne({user: req.user._id}, (err, favorite) =>{
            if(err){ return next(err); }
            if(!favorite){
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    for(var dish = 0; dish< req.body.length; dish++)
                    {
                        favorite.dishes.push(req.body[dish]);
                    }
                    favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
                }, (err) => next(err))
                .catch((err) => next(err));
            }
            else{
                for(var dish = 0; dish< req.body.length; dish++)
                {
                    if(favorite.dishes.indexOf(req.body[dish]._id.toString())< 0)
                    {   
                        favorite.dishes.push(req.body[dish]);
                    }
                }   
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
                }
            });
})

.put(authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(authenticate.verifyUser, (req,res,next) =>{
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        Favorites.findById(favorite._id)
        .populate('user')
        .populate('dishes')
        .then((favorite) => {
            console.log('Favorite Dish Dreated ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
    .catch((err) => next(err));
    })
})

favRouter.route('/:dishId')
.options( (req,res) =>{
    res.sendStatus(200);
})
.get( authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(authenticate.verifyUser, (req,res,next) =>{
        Favorites.findOne({user: req.user._id}, (err, favorite) =>{
            if(err){ return next(err); }
            if(!favorite){
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    favorite.dishes.push({ "_id": req.params.dishId });
                    favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            })}
            else {
                if (favorite.dishes.indexOf(req.params.dishId) < 0) {                
                    favorite.dishes.push({ "_id": req.params.dishId });
                    favorite.save()
                    .then((favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    })
                    .catch((err) => {
                        return next(err);
                    })
                }
                else{
                    res.statusCode = 200;
                    res.end("Favorite already added!!");
                }
            }
        });
})
.put( authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
})
.delete(authenticate.verifyUser, (req,res,next) =>{
    
    Favorites.findOne({user: req.user._id}, (err,favorite) =>{
        if(err){
            return next(err);
        }
        if(!favorite){
            res.statusCode = 200;
            res.end("No favorite to delete");
        }
        var index = favorite.dishes.indexOf(req.params.dishId);
        console.log(index)
        if(index>-1)
        {
            favorite.dishes.splice(index,1);
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
        }        
        if(index < 0) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end('This dish is not in your favorites list')
        }
    });
});

module.exports = favRouter;