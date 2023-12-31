const validator = require('validator');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const Pepper = require('../models/pepper');
const Sauce = require('../models/sauce');

// ✅ Redirect home page to Sauce List
exports.index = asyncHandler(async (req, res, next) => {
	res.redirect('/catalog/sauces');
});

// ✅ Gets a complete List of Sauces
exports.sauce_list = asyncHandler(async (req, res, next) => {
	async function getSauces() {
		if (req.query.sort === 'heat') {
			const sauces = await Sauce.find({}).sort({ scoville: -1 }).exec();
			return sauces;
		} else {
			const sauces = await Sauce.find({}).sort({ name: 1 }).exec();
			return sauces;
		}
	}

	const sort = req.query.sort;
	const sauces = await getSauces();

	sauces.forEach((sauce) => {
		// Cleans up escaped text to readable symbols
		sauce.description = validator.unescape(sauce.description);
		sauce.name = validator.unescape(sauce.name);
	});

	res.render('index', {
		title: 'Sauces',
		sauces: sauces,
		sort: sort,
	});
});

// ✅ Gets a detailed view of a single sauce
exports.sauce_detail = asyncHandler(async (req, res, next) => {
	console.log('Sauce detail');
	const [sauce] = await Promise.all([
		Sauce.findById(req.params.id).populate('pepper').exec(),
	]);

	// Cleans up escaped text to readable symbols
	sauce.description = validator.unescape(sauce.description);
	sauce.name = validator.unescape(sauce.name);

	if (sauce === null) {
		const err = new Error('Sauce not found!');
		err.status = 404;
		return next(err);
	}

	res.render('sauce_detail', {
		title: sauce.name,
		sauce: sauce,
		peppers: sauce.pepper,
	});
});

// ✅ Gets a form for adding a new sauce
exports.sauce_add_get = asyncHandler(async (req, res, next) => {
	const [allPeppers] = await Promise.all([Pepper.find({}).exec()]);

	res.render('sauce_create', {
		title: 'Add Sauce',
		peppers: allPeppers,
	});
});

// ✅ Posts a new sauce, then returns to index
exports.sauce_add_post = [
	// Converts the peppers into an array
	(req, res, next) => {
		if (!(req.body.peppers instanceof Array)) {
			if (typeof req.body.peppers === 'undefined') req.body.peppers = [];
			else req.body.peppers = new Array(req.body.peppers);
		}
		next();
	},

	body('name')
		.exists()
		.notEmpty()
		.trim()
		.isLength({ min: 3, max: 200 })
		.escape(),
	body('description').exists().notEmpty().trim().escape(),
	body('heat_rating')
		.exists()
		.notEmpty()
		.isInt({ min: 0, max: 1000000 })
		.escape(),
	body('peppers.*').escape(),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		console.log(req.body);

		const newSauce = new Sauce({
			name: req.body.name,
			description: req.body.description,
			scoville: req.body.heat_rating,
			pepper: req.body.peppers,
		});

		if (!errors.isEmpty()) {
			const [allPeppers] = await Promise.all([Pepper.find({}).exec()]);

			for (const pepper of allPeppers) {
				if (newSauce.pepper.includes(pepper)) {
					pepper.checked = true;
				}
			}

			res.render('sauce_create', {
				title: 'Add Sauce',
				peppers: allPeppers,
				sauce: newSauce,
				errors: errors.array(),
			});
		} else {
			await newSauce.save();
			res.redirect(newSauce.url);
		}
	}),
];

// Gets the sauce create form with current info already entered
exports.sauce_update_get = asyncHandler(async (req, res, next) => {
	const [allPeppers, sauce] = await Promise.all([
		Pepper.find({}).exec(),
		Sauce.findById(req.params.id).populate('pepper').exec(),
	]);

	sauce.description = validator.unescape(sauce.description);
    
	for(const pepper of allPeppers) {
        for(const sauce_pepper of sauce.pepper) {
            if(sauce_pepper._id.toString() === pepper._id.toString()) {
                pepper.checked = 'true';
            }
        }
    }

	res.render('sauce_create', {
		title: 'Update Sauce',
		peppers: allPeppers,
		sauce: sauce,
	});
});

// Updates the sauce info, and returns to detailed info of sauce
exports.sauce_update_post = [
	// Converts the peppers into an array
	(req, res, next) => {
		if (!(req.body.peppers instanceof Array)) {
			if (typeof req.body.peppers === 'undefined') req.body.peppers = [];
			else req.body.peppers = new Array(req.body.peppers);
		}
		next();
	},

	body('name')
		.exists()
		.notEmpty()
		.trim()
		.isLength({ min: 3, max: 200 })
		.escape(),
	body('description').exists().notEmpty().trim().escape(),
	body('heat_rating')
		.exists()
		.notEmpty()
		.isInt({ min: 0, max: 1000000 })
		.escape(),
	body('peppers.*').escape(),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		console.log(req.body);

		const updatedSauce = new Sauce({
            _id: req.params.id,
			name: req.body.name,
			description: req.body.description,
			scoville: req.body.heat_rating,
			pepper: req.body.peppers,
		});

		if (!errors.isEmpty()) {
			const [allPeppers, sauce] = await Promise.all([
                Pepper.find({}).exec(),
                Sauce.findById(req.params.id).populate('pepper').exec(),
            ]);
        
            sauce.description = validator.unescape(sauce.description);
            
            for(const pepper of allPeppers) {
                for(const sauce_pepper of sauce.pepper) {
                    if(sauce_pepper._id.toString() === pepper._id.toString()) {
                        pepper.checked = 'true';
                    }
                }
            }
        
            res.render('sauce_create', {
                title: 'Update Sauce',
                peppers: allPeppers,
                sauce: sauce,
            });
		} else {
            await Sauce.findByIdAndUpdate(req.params.id, updatedSauce);
            res.redirect(updatedSauce.url);
        }
	}),
];

// Gets a simple page verifying you'd like to delete the sauce
// This page should require secret password
exports.sauce_delete_get = asyncHandler(async (req, res, next) => {
	const [sauce] = await Promise.all([
		Sauce.findById(req.params.id).exec()
	]);

	if(sauce===null){
		res.redirect('/catalog/sauces');
	}
	
	res.render('sauce_delete', { title: 'Delete Sauce', sauce: sauce });
});

// Deletes the sauce, returns to list of sauces
// This step should check the password
exports.sauce_delete_post = asyncHandler(async (req, res, next) => {
	await Sauce.findByIdAndRemove(req.params.id);
	res.redirect('/catalog/sauces');
});
