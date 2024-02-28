const aqiModel = require('../models/aqi_inModel');
const historicModel = require('../models/historicModel.js');
const mongoose = require('mongoose');
const axios = require("axios");
const cron = require('node-cron');
const moment = require('moment-timezone');

mongoose.connect('mongodb+srv://chaudharyaditya41:Z67gI1uJnrGCnHuY@cluster0.jgngtnq.mongodb.net/testingAPIsDb7?retryWrites=true&w=majority', {
    usenewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB2 is connected"))
    .catch(err => console.log(err))

cron.schedule('0 * * * *', async () => {
    try {
        const originalUrl = 'https://api.waqi.info/feed/geo:10.3;20.7/?token=7124b219cbdffcfa7e30e4e0745bc252b445fb2f';
        console.log("Coming into cronjob 1");
        let bulkOps = [];
        let historicDocuments = [];
        const documents = await aqiModel.find();
        // console.log(documents);
        console.log("Documents present in the AQI collection", documents.length);
        for (let i = 0; i < 700; i++) {
            const latitude = documents[i]["latitude"];
            const longitude = documents[i]["longitude"];
            const _id = documents[i]["_id"];
            const Uid = documents[i]["Uid"];
            const LocationName = documents[i]["LocationName"];
            const StationName = documents[i]["StationName"];
            const CityName = documents[i]["CityName"];
            const StateName = documents[i]["StateName"];
            const Country = documents[i]["Country"];
            // parse the url
            const parsedUrl = new URL(originalUrl);

            // setting the latitude and longitude in the url
            const newUrl = `feed/geo:${latitude};${longitude}/`;

            // update the path in parsed url
            parsedUrl.pathname = newUrl;

            // convert the original url back to string
            const finalUrl = parsedUrl.toString();
            // console.log(finalUrl);

            const storeData = await axios.get(finalUrl);
            const dataFromAPI = storeData.data;
            // console.log(dataFromAPI);

            let PM10 = null;
            if (dataFromAPI.data.iaqi.hasOwnProperty('pm10')) {
                PM10 = dataFromAPI.data.iaqi.pm10.v;
            }
            else {
                PM10 = "NA";
            }

            let PM25 = null;
            if (dataFromAPI.data.iaqi.hasOwnProperty('pm25')) {
                PM25 = dataFromAPI.data.iaqi.pm25.v;
            }
            else {
                PM25 = "NA";
            }

            let Temperartue = null;
            if (dataFromAPI.data.iaqi.hasOwnProperty('t')) {
                let number = dataFromAPI.data.iaqi.t.v;
                Temperartue = Math.round(number);
            }
            else {
                Temperartue = "NA";
            }
            // console.log("Temperature:",Temperartue);
            let Humidity = null;
            if (dataFromAPI.data.iaqi.hasOwnProperty('h')) {
                let number = dataFromAPI.data.iaqi.h.v;
                Humidity = Math.round(number);
            }
            else {
                Humidity = "NA";
            }

            // let time = dataFromAPI.data.time.iso;
            const isoDateTime = dataFromAPI.data.time.iso;
            const time = moment.tz(isoDateTime, 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

            let DominentPollutent = null;
            if (dataFromAPI.data.hasOwnProperty('dominentpol')) {
                DominentPollutent = dataFromAPI.data.dominentpol;
            }
            else {
                DominentPollutent = "NA";
            }
            if (DominentPollutent == '') {
                if (PM10 !== "NA" && PM25 !== "NA") {
                    if (PM10 > PM25) {
                        DominentPollutent = PM10;
                    }
                    else {
                        DominentPollutent = PM25;
                    }
                }
                else if (PM10 == "NA" && PM25 != "NA") {
                    DominentPollutent = "pm25";
                }
                else if (PM10 != "NA" && PM25 == "NA") {
                    DominentPollutent = "pm10";
                }
                else {
                    DominentPollutent = "NA";
                }
            }

            let AQI = null;
            if (dataFromAPI.data.hasOwnProperty('aqi')) {
                AQI = dataFromAPI.data.aqi;
            }
            else {
                AQI = "NA";
            }

            if (AQI == '-') {
                if (PM10 != "NA" && PM25 != "NA") {
                    AQI = Math.max(PM10, PM25);
                }
                else if (PM10 == "NA" && PM25 != "NA") {
                    AQI = PM25;
                }
                else if (PM10 != "NA" && PM25 == "NA") {
                    AQI = PM10;
                }
                else {
                    AQI = "NA"
                }
            }
            const completeObj = { AQI, DominentPollutent, PM10, PM25, Temperartue, Humidity, time };
            const historicObj = { Uid, LocationName, AQI, DominentPollutent, PM10, PM25, Temperartue, Humidity, StationName, CityName, StateName, Country, time, latitude, longitude};
            historicDocuments.push(historicObj);
            let upsertDoc = {
                'updateOne': {
                    'filter': { _id: _id },
                    'update': completeObj,
                    'upsert': true
                }
            };
            // console.log(upsertDoc);
            bulkOps.push(upsertDoc);
            // console.log(updateDocument);
        }
        const result = await historicModel.insertMany(historicDocuments);
        // console.log(result);
        await aqiModel.bulkWrite(bulkOps)
            .then(bulkWriteOpResult => {
                console.log('BULK update OK');
                console.log(JSON.stringify(bulkWriteOpResult, null, 2));
            })
            .catch(err => {
                console.log('BULK update error');
                console.log(JSON.stringify(err, null, 2));
            });
        console.log("Finished Updating cron 1")
    }
    catch (error) {
        console.log(error.message);
    }
});