const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

var passport = require('passport');
var LocalStrategy = require('passport-local');

// This function is called with authenticate()
passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const user = await User.findOne({ username: username });
			if (!user) {
				return done(null, false, { message: 'Incorrect username!' });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				// passwords do not match!
				return done(null, false, { message: 'Incorrect password' });
			}

			return done(null, user);
		} catch (err) {
			return done(err);
		}
	})
);

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
	try {
		const user = await User.findById(id);
		done(null, { name: user.username });
	} catch (err) {
		done(err);
	}
});

/* GET sign up page. */
router.get('/', function (req, res, next) {
	res.redirect('/users/sign-in');
});

/* GET sign up page. */
router.get('/sign-up', function (req, res, next) {
	res.render('sign-up-form', {
		title: 'Sign Up',
	});
});

// POST sign up page
router.post('/sign-up', [
	body('username').exists().notEmpty().trim().isLength({ min: 8, max: 30 }),
	body('password')
		.exists()
		.notEmpty()
		.trim()
		.matches(/^[a-zA-Z0-9]+$/g)
		.isLength({ min: 8, max: 30 }),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const error = new Error('Invalid user input');
			error.status = 422;
			return next(error);
		} else {
			bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
				const user = new User({
					username: req.body.username,
					password: hashedPassword,
				});
				await user.save();
				res.redirect('/');
			});
		}
	}),
]);

// GET Sign in page
router.get(
	'/sign-in',
	asyncHandler(async (req, res, next) => {
		res.render('login-form', {
			title: 'Log In',
		});
	})
);

// POST Sign in logic
router.post(
	'/sign-in',
	passport.authenticate('local', {
		successRedirect: '/catalog/sauces',
		failureMessage: 'Invalid info',
		failureRedirect: '/users/sign-in',
	})
);

router.get('/log-out', (req, res, next) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect('/');
	});
});

module.exports = router;
