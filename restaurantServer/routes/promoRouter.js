const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')


//Promotions
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})

.get((req,res, next)  => {
    res.end('Will send all the promotions to you!');
})

.post((req,res,next) => {
    res.end('Will add the promotion ' + req.body.name 
    + ' with details: ' + req.body.description)
})

.put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supperted on /promotions')
})

.delete((req,res,next)  => {
    res.end('Deleting all the promotions!')
});

// PromoId
promoRouter.route('/:promoId')


.get((req,res,next)  => {
    res.end('Will send send details of the promotion: ' + req.params.promoId)
})

.post((req,res,next) => {
    res.statusCode = 403;
    res.end('post operation not supperted on /promo/' + req.params.promoId)
})

.put((req,res,next) => {
    res.write('Updating the promotion: ' + req.params.promoId + '\n');
    res.end('Will update the promotion: ' + req.body.name + ' with details: ' + req.body.description)
})

.delete((req,res, next)  => {
    res.end('Deleting promotion: ' + req.params.promoId);
});
module.exports = promoRouter;