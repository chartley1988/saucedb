const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PepperSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
})

PepperSchema.virtual('url').get(function(){
    return `/catalog/peppers/${this._id}`;
})

module.exports = mongoose.model('Pepper', PepperSchema);
