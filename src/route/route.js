const express = require('express');
const requestController = require('../controllers/requestController');
const userController = require('../controllers/userController');
const testController = require('../controllers/testController');
const automaticController = require('../controllers/automaticController');

const router = express.Router();
const cron = require('node-cron');

// testing API
router.post('/testingAPI',testController.testFunction);

// city/station feed API
router.post('/getRequest',requestController.requestFunction);

// geolocalised API
router.post('/geolocalisedFeed',requestController.geolocalisedFeed);

// location on the map API
router.post('/locationOnTheMap',requestController.locationOnTheMap);

// API to sign up or to register a user
router.post('/registerUser',userController.regiterUser);

// API to login a user
router.post('/loginUser',userController.loginUser);

// scheduling the task to run on the server
cron.schedule('0 * * * *',automaticController.scheduledTask);

module.exports = router;