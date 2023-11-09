const aqiModel = require('../models/aqi_inModel');
const axios = require("axios");

const testFunction = async function (req, res) {
    try {
        // console.log("On API hit");
        // res.status(200).send({ status: true, message: "API running" });

        // getting URL from third party
        // const apiUrl = 'https://api.waqi.info/feed/@{pathParam}/?token=7124b219cbdffcfa7e30e4e0745bc252b445fb2f';

        // const pathParamValue = req.body.idx;
        // const finalUrl = apiUrl.replace('{pathParam}', pathParamValue);
        // console.log(finalUrl);

        // const storeData = await axios.get(finalUrl);
        // const dataFromAPI = storeData.data;
        // console.log(dataFromAPI);

        // const filter = { SerialNo: dataFromAPI.data.idx };
        // const update = {
        //     $set: {
        //         AQI_IN: dataFromAPI.data.aqi,
        //         PM25: dataFromAPI.data.iaqi.pm25.v,
        //         PM10: dataFromAPI.data.iaqi.pm10.v,
        //         Temp: dataFromAPI.data.iaqi.t.v,
        //         Humidity: dataFromAPI.data.iaqi.h.v,
        //         Time: dataFromAPI.data.time.s
        //     }
        // };
        // const result = await aqiModel.findOneAndUpdate(filter, update, { new: true });
        // console.log(result);
        const arr = [13579,-415807,-345292,12632,9319,9265,-246586,9322,13643,5162,8429,-373498,9272,10557,9266,13580,5750,
            -416398,10095,9269,5749,5751,12631,9318,9320,9321,9268,13578,9263,10558,9264,9323,14863,9267,8423,
            -125704,-191224,10573,-207097,-109609,-234946,9261,14563,-198082,-196873,-403735,-237319,-420973,-98416,
            -237322,7649,14566,-364897,-190630,-366481,-194233,-243655,10563,-235870,-379015,-374848,-198436,14784,
            14779,-245275,-236449,-189766,8590,8086,14785,-230176,-192751,-192283,-233365,10572,4160,-356530,
            -170428,-192142,-177700,9258,14565,14787,-365821,-185218,-216391,-231535,4172,7655,-192073,-190333,
            -192835,14570,8096,-185221,14783,6852,-109825,-196537,14789,-109177,-230224,-373165,-222349,6849,
            -109864,-230131,-190057,-207121,-104110,-343354,10577,-231700,-196765,4174,12646,-373384,-109702,
            -230221,-373408,-109861,-180913,-121957,-196789,-229135,13641,-358372,-360250,-129778,-193120,7644,
            -236467,-187810,-206011,-221959,4175,10560,-373405,-417121,-122974,-192682,-403027,12643,7642,-122971,
            -121855,12401,-114142,-243301,-169045,-237292,10565,10561,8588,-197806,-216259,-420700,10574,-67753,
            -354676,-355756,-230173,-123094,8097,14788,-189331,-235957,8764,-373333,-228364,-67750,6853,-224716,
            -363907,11674,14559,-198619,-194059,-190426,-364360,-376132,-190045,14786,-371356,-250936,13639,12893,
            -361174,-363880,-190267,-231379,-111148,-187507,-248989,-196303,-235795,14558,-360271,-373381,-230236,
            -189313,-218656,9259,-109834,-237307,-66424,12892,-359575,-110290,-207352,-180976,12436,12633,-377350,
            -196003,4176,-224998,-238453,-109879,10091,14561,-88786,-403120,-196678,8762,14564,-235915,-222379,
            -122959,-110578,12894,-191194,-349231,-349327,6832,-188131,-235216,-344266,6834,8575,-114166];

        console.log("length is", arr.length);
        let map = new Map();


        for (let i = 0; i < arr.length; i++) {
            map.set(arr[i], (map.get(arr[i]) || 0) + 1)
        }

        console.log(map);
        // for(let pairs of map){
        //     console.log(pairs[0]);
        // }
        return res.status(200).send({ status: true, message: "API running fine", data: dataFromAPI });

    }
    catch (error) {
        console.log({ status: false, message: error.message });
    }
}

module.exports = { testFunction };