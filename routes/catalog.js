const express = require('express');
const router = express.Router();

const sauce = require("../controllers/sauceController");
const pepper = require("../controllers/pepperController");

// PEPPER ROUTES
router.get('/peppers', pepper.pepper_list);
router.get('/peppers/add', pepper.pepper_add_get);
router.post('/peppers/add', pepper.pepper_add_post);
router.get('/peppers/:id', pepper.pepper_detail);

// SAUCE ROUTES
router.get("/", sauce.index);
router.get("/sauces", sauce.sauce_list);
router.get("/sauces/add", sauce.sauce_add_get);
router.post("/sauces/add", sauce.sauce_add_post);
router.get("/sauces/:id", sauce.sauce_detail);


module.exports = router;