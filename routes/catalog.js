const express = require('express');
const router = express.Router();

const sauce = require("../controllers/sauceController");
const pepper = require("../controllers/pepperController");

// PEPPER ROUTES
router.get('/peppers', pepper.pepper_list);
router.get('/peppers/add', pepper.pepper_add_get);
router.post('/peppers/add', pepper.pepper_add_post);

router.get('/peppers/:id/update', pepper.pepper_update_get);
router.post('/peppers/:id/update', pepper.pepper_update_post);
router.get('/peppers/:id', pepper.pepper_detail);

router.get('/peppers/:id/delete', pepper.pepper_delete_get);
router.post('/peppers/:id/delete', pepper.pepper_delete_post);

// SAUCE ROUTES
router.get("/", sauce.index);
router.get("/sauces", sauce.sauce_list);

router.get("/sauces/add", sauce.sauce_add_get);
router.post("/sauces/add", sauce.sauce_add_post);

router.get("/sauces/:id/update", sauce.sauce_update_get);
router.post("/sauces/:id/update", sauce.sauce_update_post);
router.get("/sauces/:id", sauce.sauce_detail);

router.get("/sauces/:id/delete", sauce.sauce_delete_get);
router.post("/sauces/:id/delete", sauce.sauce_delete_post);


module.exports = router;