const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const feedback = require('../models/feedback');
const Feedbacks = require('../models/feedback');

const feedbackRouter = express.Router();

feedbackRouter.use(bodyParser.json());

feedbackRouter.route('/')

.post((req,res,next) => {
    Feedbacks.create(req.body)
    .then((feedback) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, (err) =>next(err))
    .catch((err) => next(err))
})

module.exports = feedbackRouter;