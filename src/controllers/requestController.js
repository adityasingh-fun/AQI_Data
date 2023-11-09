const requestModel = require('../models/requestModel');
const mapModel = require('../models/mapModel');
const aqiModel = require('../models/aqi_inModel')
const axios = require("axios");
const url = require('url');
const fetch = require('node-fetch-commonjs');

const apiKey = '3867a440cd664d9f870fbadab4509ad4';
const arrayOfUid = [];
console.log("size of array is", arrayOfUid.length);

const reverseGeoCode = async function (latitude, longitude) {
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        // console.log(data);
        // console.log(data.results[0]);
        if (data.results.length > 0) {
            const result = data.results[0];
            const city = result.components.city;
            const state = result.components.state_district;
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
        const dataFromAPI = storeData.data;
        console.log(dataFromAPI);
        // console.log(dataFromAPI.data);

        // checking if we are getting pm10 from third party api, if not then setting the value of pm10 to null
        let pm10 = null;
        if (dataFromAPI.data.iaqi.hasOwnProperty('pm10')) {
            // console.log("pm10 key hai");
            pm10 = dataFromAPI.data.iaqi.pm10.v;
        }
        // checkingif we are getting pm25 from third party api, if not then setting the value of pm25 to null 
        let pm25 = null;
        console.log(dataFromAPI.data.iaqi);
        if (dataFromAPI.data.iaqi.hasOwnProperty('pm25')) {
            // console.log("pm25 key hai");
            pm25 = dataFromAPI.data.iaqi.pm25.v;
        }
        // checking if we are getting temperature from third party API, if not then setting the value of temprature to null
        let temp = null;
        console.log(dataFromAPI.data.iaqi);
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
        console.log(finalData)

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

module.exports = { requestFunction, geolocalisedFeed, locationOnTheMap };