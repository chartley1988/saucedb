const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const Pepper = require('../models/pepper');
const Sauce = require('../models/sauce');

// ✅ Gets a complete list of Peppers 
exports.pepper_list = asyncHandler(async (req, res, next) => {
	const [peppers] = await Promise.all([Pepper.find({}).exec()]);

	res.render('pepper_list', { title: 'Peppers', peppers: peppers });
});

// ✅ Gets a detailed view of a single sauce 
exports.pepper_detail = asyncHandler(async (req, res, next) => {
	const [ pepper, saucesWithPepper ] = await Promise.all([
		Pepper.findById(req.params.id).exec(),
		Sauce.find({pepper: req.params.id}, 'name url').exec(),
	]);

	if(pepper === null) {
		const error = new Error('No such pepper exists here!');
		error.status = 404;
		return next(error);
	};

	res.render('pepper_detail', {
		title: pepper.name,
		pepper: pepper,
		sauces: saucesWithPepper,
	})
})

// ✅ Gets form for adding a pepper
exports.pepper_add_get = asyncHandler(async (req, res, next) => {
	res.render('pepper_create', { title: 'Add Pepper' });
});

// ✅ Handles POST logic of adding a pepper
exports.pepper_add_post = [
	body('name')
		.trim()
		.isLength({min: 1})
		.escape(),
	body('description')
		.trim()
		.isLength({min: 1, max: 600})
		.escape(),
	
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		const newPepper = new Pepper({
			name: req.body.name,
			description: req.body.description,
		});

		if(!errors.isEmpty()) {
			res.render('pepper_create', {
				title: 'Add Pepper',
				pepper: newPepper,
				errors: errors.array(),
			});
		} else {
			await newPepper.save();
			res.redirect(newPepper.url);
		}

	})
	

]
	// Sanitize results


	
