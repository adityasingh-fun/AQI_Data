const aqiModel = require('../models/aqi_inModel');
const mongoose = require('mongoose');
const axios = require("axios");
const cron = require('node-cron');

mongoose.connect('mongodb+srv://chaudharyaditya41:Z67gI1uJnrGCnHuY@cluster0.jgngtnq.mongodb.net/testingAPIsDb5?retryWrites=true&w=majority', {
    usenewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB7 is connected"))
    .catch(err => console.log(err))

cron.schedule('0 * * * *', async () => {
    try {
        const originalUrl = 'https://api.waqi.info/feed/geo:10.3;20.7/?token=7124b219cbdffcfa7e30e4e0745bc252b445fb2f';
        console.log("Coming into cronjob 6");
        let count = 0;
        const documents = await aqiModel.find();
        // console.log(documents);
        console.log("Documents present in the AQI collection", documents.length);
        for (let i = 3500; i < 4200; i++) {
            const latitude = documents[i]["latitude"];
            const longitude = documents[i]["longitude"];
            const _id = documents[i]["_id"];
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
                Temperartue = dataFromAPI.data.iaqi.t.v;
            }
            else {
                Temperartue = "NA";
            }
            // console.log("Temperature:",Temperartue);
            let Humidity = null;
            if (dataFromAPI.data.iaqi.hasOwnProperty('h')) {
                Humidity = dataFromAPI.data.iaqi.h.v;
            }
            else {
                Humidity = "NA";
            }

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

            const completeObj = { AQI, DominentPollutent, PM10, PM25, Temperartue, Humidity, };
            const updateDocument = await aqiModel.findOneAndUpdate(
                {_id:_id},
                {$set:completeObj},
                {new:true}
            )
            // console.log(updateDocument);
        }
        console.log("Finished Updating cron 6")
    }
    catch (error) {
        console.log(error.message);
    }
});