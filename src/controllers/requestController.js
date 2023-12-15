const requestModel = require('../models/requestModel');
const mapModel = require('../models/mapModel');
const aqiModel = require('../models/aqi_inModel')
const axios = require("axios");
const url = require('url');
const fetch = require('node-fetch-commonjs');
const fs = require('fs');
const csv = require('csv-parser');
const translate = require('translate-google');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const onlyAlphabetsRegex = /^[a-zA-Z\s]+$/;

// specifying the path of csv file
const csvFilePath = "C:\\Users\\lenovo\\Downloads\\sandy69.csv";

const apiKey = '3867a440cd664d9f870fbadab4509ad4';
// const apiKey = '8b18ed393f034c419df8318dd4b3f421';
// const apiKey = 'b8cb2f9434124ca5ad54b6bd1861d624';
// const apiKey = '263a61fbbebc414a8ef4d5a748708433';
// const apiKey = '70c5c589a9b648cebb82f36b572406b0';

const arrayOfUid = [];
console.log("size of array is", arrayOfUid.length);

const reverseGeoCode = async function (latitude, longitude) {
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);
        console.log(data.results[0]);
        if (data.results.length > 0) {
            const result = data.results[0];

            const city = result.components.city;
            const state = result.components.state;
            const country = result.components.country;

            const cityStateCountry = {
                city,
                state,
                country
            }
            // console.log(cityStateCountry);
            return cityStateCountry;
        }
        else {
            return null;
            // console.log("hello");
        }
    }
    catch (error) {
        // return res.status(500).send({status:false,message:error.message});
        console.log("message:", error.message);
    }
};


const reverseGeoCode2 = async function (latitude, longitude) {
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        // console.log(data);
        // console.log(data.results[0]);
        if (data.results.length > 0) {
            const result = data.results[0];

            let city = result.components.city;
            if (city == undefined) {
                city = result.components.town;
            }
            let state = result.components.state;
            if (state == undefined) {
                state = result.components.city;
            }
            let country = result.components.country;

            let locationName = null;
            if (result.components.hasOwnProperty('museum')) {
                locationName = result.components.museum;
            }
            else if (result.components.hasOwnProperty('school')) {
                locationName = result.components.school;
            }
            else if (result.components.hasOwnProperty('building')) {
                locationName = result.components.building;
            }
            else if (result.components.hasOwnProperty('sports_centre')) {
                locationName = result.components.sports_centre;
            }
            else if (result.components.hasOwnProperty('office')) {
                locationName = result.components.office;
            }
            else if (result.components.hasOwnProperty('research_institute')) {
                locationName = result.components.research_institute;
            }
            else if (result.components.hasOwnProperty('wastewater_plant')) {
                locationName = result.components.wastewater_plant;
            }
            else if (result.components.hasOwnProperty('clinic')) {
                locationName = result.components.clinic;
            }
            else if (result.components.hasOwnProperty('parking')) {
                locationName = result.components.parking;
            }
            else if (result.components.hasOwnProperty('police')) {
                locationName = result.components.police;
            }
            else if (result.components.hasOwnProperty('library')) {
                locationName = result.components.library;
            }
            else if (result.components.hasOwnProperty('university')) {
                locationName = result.components.university;
            }
            else if (result.components.hasOwnProperty('fitness_centre')) {
                locationName = result.components.fitness_centre;
            }
            else if (result.components.hasOwnProperty('bank')) {
                locationName = result.components.bank;
            }
            else if (result.components.hasOwnProperty('archaeological_site')) {
                locationName = result.components.archaeological_site;
            }
            else if (result.components.hasOwnProperty('townhall')) {
                locationName = result.components.townhall;
            }
            else if (result.components.hasOwnProperty('road')) {
                locationName = result.components.road;
            }
            else if (result.components.hasOwnProperty('suburb')) {
                locationName = result.components.suburb;
            }
            else{
                locationName = null;
            }

            if(locationName == "unnamed road"){
                locationName = result.components.suburb;
            }
            const stationName = `${locationName},${city},${state},${country}`


            const cityStateCountry = {
                locationName,
                stationName,
                city,
                state,
                country
            }
            // console.log(cityStateCountry);
            return cityStateCountry;
        }
        else {
            return null;
            // console.log("hello");
        }
    }
    catch (error) {
        // return res.status(500).send({status:false,message:error.message});
        console.log("message:", error.message);
    }
}

const requestFunction = async function (req, res) {
    try {
        // getting URL from third party
        const apiUrl = 'https://api.waqi.info/feed/{pathParam}/?token=7124b219cbdffcfa7e30e4e0745bc252b445fb2f';

        // getting city name from request body and setting it in the URL
        const pathParamValue = req.body.city;
        const finalUrl = apiUrl.replace('{pathParam}', pathParamValue);
        console.log(finalUrl);
        const storeData = await axios.get(finalUrl);
        // console.log(storeData);
        const dataFromAPI = storeData.data;
        console.log(dataFromAPI);
        // console.log(dataFromAPI.data);
        return res.status(201).send({ status: false, message: storeData })
        // checking if we are getting pm10 from third party api, if not then setting the value of pm10 to null
        let pm10 = null;
        if (dataFromAPI.data.iaqi.hasOwnProperty('pm10')) {
            // console.log("pm10 key hai");
            pm10 = dataFromAPI.data.iaqi.pm10.v;
        }
        // checkingif we are getting pm25 from third party api, if not then setting the value of pm25 to null 
        let pm25 = null;
        // console.log(dataFromAPI.data.iaqi);
        if (dataFromAPI.data.iaqi.hasOwnProperty('pm25')) {
            // console.log("pm25 key hai");
            pm25 = dataFromAPI.data.iaqi.pm25.v;
        }
        // checking if we are getting temperature from third party API, if not then setting the value of temprature to null
        let temp = null;
        // console.log(dataFromAPI.data.iaqi);
        if (dataFromAPI.data.iaqi.hasOwnProperty('t')) {
            // console.log("temperature key hai");
            temp = dataFromAPI.data.iaqi.t.v;
        }
        // checking if we are getting humidity from third party API, if not thyen setting the value of humidity to null
        let humidity = null;
        if (dataFromAPI.data.iaqi.hasOwnProperty('h')) {
            // console.log("humidity key hai");
            humidity = dataFromAPI.data.iaqi.h.v;
        }


        const latitude = dataFromAPI.data.city.geo[0];
        const longitude = dataFromAPI.data.city.geo[1];
        console.log("latitude is", latitude, "and longitude is", longitude);
        const latLon = await reverseGeoCode(latitude, longitude);
        console.log(latLon);
        const finalData = {
            SerialNo: dataFromAPI.data.idx,
            location: dataFromAPI.data.city.name,
            City: latLon.city,
            State: latLon.state,
            Country: latLon.country,
            AQI_IN: dataFromAPI.data.aqi,
            PM25: pm25,
            PM10: pm10,
            Temp: temp,
            Humidity: humidity,
            Time: dataFromAPI.data.time.s
        }
        // console.log(finalData)

        // store the data in mongoDB database
        const createData = await aqiModel.create(finalData);

        return res.status(201).send({ status: true, message: "Data stored in database successfully", data: createData })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// setInterval(requestFunction,2000);

const geolocalisedFeed = async function (req, res) {
    try {
        // getting URL from third party API
        const originalUrl = 'https://api.waqi.info/feed/geo:10.3;20.7/?token=7124b219cbdffcfa7e30e4e0745bc252b445fb2f';

        // parse the url
        const parsedUrl = new URL(originalUrl);

        // getting latitude and longitude from the request body
        const newlatitude = req.body.latitude;
        const newLongitude = req.body.longitude;

        // setting the latitude and longitude in the url
        const newUrl = `feed/geo:${newlatitude};${newLongitude}/`;

        // update the path in parsed url
        parsedUrl.pathname = newUrl;

        // convert the original url back to string
        const finalUrl = parsedUrl.toString();
        console.log(finalUrl);

        const getData = await axios.get(finalUrl);
        // console.log("getData")
        const data = getData.data;
        console.log(data);

        const createData = await requestModel.create(data);

        return res.status(200).send({ status: true, message: "Data stored in database successfully", data: createData });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const locationOnTheMap = async function (req, res) {
    try {
        // getting url from third party API
        const originalUrl = 'https://api.waqi.info/v2/map/bounds?latlng=39.379436,116.091230,40.235643,116.784382&networks=all&token=7124b219cbdffcfa7e30e4e0745bc252b445fb2f';
        console.log('original url', originalUrl);

        // parse the url
        const parsedUrl = new URL(originalUrl);
        console.log(parsedUrl);

        // getting latitudes and logitudes from the request body
        const latStart = req.body.latitudeStart;
        const lonStart = req.body.longitudeStart;
        const latEnd = req.body.latitudeEnd;
        const lonEnd = req.body.longitudeEnd;

        const latlngValues = [`${latStart}`, `${lonStart}`, `${latEnd}`, `${lonEnd}`].join(',');

        // setting the latitudes and longitudes in the new url
        parsedUrl.searchParams.set('latlng', latlngValues);
        console.log(parsedUrl);

        // convert the original url back to string
        const finalUrl = parsedUrl.toString();
        console.log(finalUrl);

        const getData = await axios.get(finalUrl);
        const objData = getData.data;
        const data = objData.data;
        for (let i = 0; i < data.length; i++) {
            arrayOfUid[i] = data[i].uid;
        }
        // console.log("data is as follows",data);
        console.log(arrayOfUid);

        // const createData = await mapModel.create(objData);

        return res.status(201).send({ status: true, message: "getting the response", data: arrayOfUid });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// get locations based on latitude and longitude
const getLocations = async function (req, res) {
    try {
        const latitude = req.body.latitude;
        const longitude = req.body.longitude;

        console.log("latitude is", latitude, "and longitude is", longitude);
        const latLon = await reverseGeoCode(latitude, longitude);
        console.log(latLon);
        return res.status(200).send({ status: false, message: "API running successfully" });
    }
    catch (error) {
        return res.status(500).send({ status: true, message: error.message });
    }
}

// retrieving data from csv file
const getCsvData = async function (req, res) {
    try {
        // creating an array to store the parsed data
        const data = [];

        // printing the file path of CSV file on console
        console.log("File path of CSV is:", csvFilePath)

        // using the fs module to store the parsed data
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                // we will build our logic here
                const latitude = row.lat;
                const longitude = row.lon;
                const latLonObj = {
                    latitude,
                    longitude
                }
                console.log("printing the data in each row", row);
                // data.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                // Now we can work with the 'data' array to work with the parsed CSV data
                // console.log(data);
            })
            .on('error', (error) => {
                // Handles the errors that occured during parsing process
                console.error('Error parsing CSV:', error.message);
            })

        return res.status(200).send({ status: true, message: "API running successfully" });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

// retrieving locations from CSV containing special characters
const specialCharacterLocations = async function (req, res) {
    try {

        // const fullName = req.body.fullName;
        // const isValidName = onlyAlphabetsRegex.test(fullName)

        // creating an array to store the parsed data
        const data = [];
        const locName = [];

        // printing the file path of CSV file on console
        console.log("File path of CSV is:", csvFilePath)

        // using the fs module to store the parsed data
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                // we will build our logic here
                // console.log(row);
                const obj = {
                    uid: row.uid,
                    locationName: row.cityname
                }
                if (!(onlyAlphabetsRegex.test(row.cityname))) {
                    locName.push(obj);
                }
                // data.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                // Now we can work with the 'data' array to work with the parsed CSV data
                // console.log(data);
                console.log(locName);
                console.log("count of stations", locName.length);
                return res.status(200).send({ status: true, message: "API running successfully", data: locName });
            })
            .on('error', (error) => {
                // Handles the errors that occured during parsing process
                console.error('Error parsing CSV:', error.message);
                return res.status(500).send({ status: false, message: error.message });
            })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const translator = async function (req, res) {
    try {
        const originalString = req.body.originalString;
        const englishString = await translate(originalString, { to: 'en' });
        console.log("Original string:", originalString);
        console.log("converted String:", englishString);

        return res.status(201).send({ status: true, message: "String converted to english successfully", data: englishString });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const writingInCsv = function (req, res) {
    try {
        const jsonData = [
            { "name": "Somesh", "city": "New York", "age": "30" },
            { "name": "Bimal", "city": "Vancouver", "age": "28" },
            { "name": "Brijesh", "city": "Ghaziabad", "age": "26" }
        ];
        const csvWriter = createCsvWriter({
            path: "C:\\Users\\lenovo\\Downloads\\checking.csv",
            header: [
                { "id": "name", "title": "Name" },
                { "id": "city", "title": "City" },
                { "id": "age", "title": "Age" }
            ]
        });

        // Write json data to csv file
        csvWriter.writeRecords(jsonData)
            .then(() => console.log("CSV written successfully"))
            .catch(err => console.error("Error writing csv file", err));

        return res.status(201).send({ status: true, message: "Data written csv successfully" });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const convertingTheCsv = async function (req, res) {
    try {
        // creating an array to store the parsed data
        const data = [];

        // printing the file path of CSV file on console
        console.log("File path of CSV is:", csvFilePath)

        // using the fs module to store the parsed data
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', async (row) => {
                // we will build our logic here
                const engLocationName = await translate(row.locationName, { to: 'en' });
                // console.log("engLocationName",engLocationName)
                const engStationName = await translate(row.stationName, { to: 'en' });
                // console.log("engStationName",engStationName)
                const engCityName = await translate(row.cityName, { to: 'en' });
                const engStateName = await translate(row.stateName, { to: 'en' });
                const engcountryName = await translate(row.country, { to: 'en' });
                // const latitude = row.lat;
                // const longitude = row.lon;
                const completeObj = {
                    engLocationName,
                    engStationName,
                    engCityName,
                    engStateName,
                    engcountryName
                }
                // console.log("The object is as follows:",completeObj)
                // console.log("printing the data in each row", row);
                data.push(completeObj);
            })
            .on('end', async () => {
                console.log('CSV file successfully processed');
                // Now we can work with the 'data' array to work with the parsed CSV data
                console.log("Data obj is as follows", data);
            })
            .on('error', (error) => {
                // Handles the errors that occured during parsing process
                console.error('Error parsing CSV:', error.message);
            })

        // console.log("Data obj is as follows",data);

        return res.status(200).send({ status: true, message: "API running successfully" });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const testerfunction = async function (req, res) {
    try {
        // creating array to store parsed data
        const data = [];

        // printing the file path of csv file on console
        console.log("File pth of CSV is", csvFilePath);

        let inStream;
        inStream = fs.createReadStream(csvFilePath);

        const readable = inStream.pipe(csv());

        for await (const record of readable) {
            // console.log("let' see what is in the record",record);
            // console.log("checking the data type of record", typeof(record));

            const lat = record.lat;
            const lon = record.lon;
            const uid = record.uid;

            const gettingLocations = await reverseGeoCode2(lat, lon);
            console.log(gettingLocations);
            // const uid = record.uid;
            // const locationName = await translate(record.locationName, { to: 'en' });
            const locationName = gettingLocations.locationName;
            const stationname = gettingLocations.stationName;
            const cityname = gettingLocations.city;
            const statename = gettingLocations.state;
            const country = gettingLocations.country;

            const latLon = await reverseGeoCode2(lat, lon);
            console.log(latLon);

            const completeObj = {
                uid,
                locationName,
                stationname,
                cityname,
                statename,
                country,
                lat,
                lon
            }
            console.log("The object is as follows:", completeObj)
            // console.log("printing the data in each row", row);
            data.push(completeObj);
        }
        console.log("The location array is", data);
        console.log("This will print in end");

        // writing data in CSV file
        const csvWriter = createCsvWriter({
            path: "C:\\Users\\lenovo\\Downloads\\mandy69.csv",
            header: [
                { id: "uid", title: "uid" },
                { id: "locationName", title: "locationName" },
                { id: "stationname", title: "stationname" },
                { id: "cityname", title: "cityname" },
                { id: "statename", title: "statename" },
                { id: "country", title: "country" },
                { id: "lat", title: "lat" },
                { id: "lon", title: "lon" }
            ]
        });

        csvWriter.writeRecords(data)
            .then(() => console.log("CSV written successfully"))
            .catch(err => console.error("Error writing csv file", err));
        return res.status(200).send({ status: true, message: "API running successfully" });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const locationTesting = async function (req, res) {
    try {
        const lat = req.body.latitude;
        const lon = req.body.longitude;

        const gettingLocations = await reverseGeoCode2(lat, lon);
        console.log(gettingLocations);

        return res.status(200).send({ status: true, message: "API running successfully" });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = {
    requestFunction, geolocalisedFeed, locationOnTheMap, getLocations, getCsvData,
    specialCharacterLocations, translator, writingInCsv, convertingTheCsv, testerfunction,
    locationTesting
};