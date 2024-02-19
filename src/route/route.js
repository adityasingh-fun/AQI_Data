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

// storing data in db based on uid
router.get('/gettingAQIOfStations',requestController.gettingAQIOfStations);

// tester function for storing AQI that is not given by the API
router.get('/tester3',requestController.tester3);

// creating NoSQL database using latitude and longitude
router.get('/tester4',requestController.tester4);

// checking dupilicate entries in the database
router.get('/tester5',requestController.tester5);

// Iterating over each element of the collection
router.get('/functionForIterating',requestController.functionForIteratingOverEachDocument);

// geolocalised API
router.post('/geolocalisedFeed',requestController.geolocalisedFeed);

// location on the map API
router.post('/locationOnTheMap',requestController.locationOnTheMap);

// API to sign up or to register a user
router.post('/registerUser',userController.regiterUser);

// API to login a user
router.post('/loginUser',userController.loginUser);

// API to get location based on latitude and longitude
router.post('/getLocationsBasedOnLatLon',requestController.getLocations);

// API to retrive data from csv 
router.get('/gettingcsvData',requestController.getCsvData);

// API to retrieve the locations which contains special characters
router.get('/getSpecialCharacterLocations',requestController.specialCharacterLocations);

// API to translate any language to english
router.post('/convertToEnglish',requestController.translator);

// API to write data in a csv file
router.get('/writingDataInCSV',requestController.writingInCsv)

// API to retrieve data from a CSV file, read the values of a row, then translate each data point to english
// and then again create a csv file
router.get('/convertingCsvToEnglish',requestController.convertingTheCsv);

router.get('/testerApi',requestController.testerfunction);

// Testing locations
router.post('/locationTesting',requestController.locationTesting);

// API to get same city and state names
router.get('/sameCityAndStateName',requestController.sameCityAndStateName);

router.get('/testerFunction2',requestController.testerFunction2);

// API to get different city and state names
router.get('/differentCityAndStateName',requestController.differentCityAndStateName);

// scheduling the task to run on the server
// cron.schedule('0 * * * *',automaticController.scheduledTask);

module.exports = router;