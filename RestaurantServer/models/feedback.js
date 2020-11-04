const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type : String,
        required: true
    },
    telnum: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    agree: {
        type: Boolean,
        
    },
    contactType: {
        type: String,
    },
    message: {
        type: String,
        requied: true
    }
},{
        timestamps: true
    
});

const Feedbacks = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedbacks