const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SauceSchema = new Schema({
	name: { type: String, required: true, minLength: 3, maxLength: 200 },
	description: { type: String, required: true },
	scoville: { type: Number, required: true, min: 0 },
	price: { type: Number },
	pepper: {
		type: Schema.Types.ObjectId,
		ref: 'Pepper',
		required: true,
	},
	heat_rating: {
		type: String,
		enum: ['mild', 'medium', 'hot', 'extreme'],
		required: true,
	},
});

SauceSchema.virtual('url').get(function () {
	return `/sauces/${this._id}`;
});

module.exports = mongoose.model('Sauce', SauceSchema);