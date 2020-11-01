const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');

const favRouter = express.Router();

favRouter.use(bodyParser.json());

favRouter.route('/')
.options(cors.corsWithOptions,(req,res) =>{
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({ user: req.user._id}, (err,favorite)=>{
        console.log(req.user._id)
        if(err){ return next(err);}
        if(!favorite){
            res.statusCode = 403;
            res.end("No favorites found!!");
        }
    })
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
   
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
                    .then((favorite) =>{
                        console.log('favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
            }, (err) => next(err))
            .catch((err) => next(err));
            }else{
                for(var dish = 0; dish< req.body.length; dish++)
                {
                    if(favorite.dishes.indexOf(req.body[dish]._id.toString())< 0)
                    {   
                        console.log(favorite.dishes)
                        console.log(req.body[dish]._id)
                        console.log(favorite.dishes.indexOf(req.body[dish]._id.toString()))
                        favorite.dishes.push(req.body[dish]);
                    }
                }   
                favorite.save()
                .then((favorite) =>{
                    console.log('favorite added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            }
        });
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})

favRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) =>{
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
        Favorites.findOne({user: req.user._id}, (err, favorite) =>{
            if(err){ return next(err); }
            if(!favorite){
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                    .then((favorite) =>{
                        console.log('favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
            }, (err) => next(err))
            .catch((err) => next(err));
            }else{
                if(favorite.dishes.indexOf(req.params.dishId)< 0){
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                    .then((favorite) =>{
                        console.log('favorite added ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
                }else{
                    res.statusCode = 200;
                    res.end("Favorite already added!!");
                }
            }
        });
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    
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
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        if(index < 0) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end('This dish is not in your favorites list')
        }
    });
});

module.exports = favRouter;