const userModel = require('../models/userModel');
const aqiModel = require('../models/aqi_inModel');
const bcrypt = require('bcrypt');
const json2html = require('node-json2html');
const fs = require('fs');

let template_table_header = {
    "<>": "tr","html": [
        {"<>":"th","html":"Serial No."},
        {"<>":"th","html":"Location"},
        {"<>":"th","html":"City"},
        {"<>":"th","html":"State"},
        {"<>":"th","html":"Country"},
        {"<>":"th","html":"AQI_IN"},
        {"<>":"th","html":"PM2.5"},
        {"<>":"th","html":"PM10"},
        {"<>":"th","html":"Temp"},
        {"<>":"th","html":"Humidity"},
        {"<>":"th","html":"Time"},

    ]
};

let template_table_body = {
    "<>":"tr","html":[
        {"<>":"td","html":"${SerialNo}"},
        {"<>":"td","html":"${location}"},
        {"<>":"td","html":"${City}"},
        {"<>":"td","html":"${State}"},
        {"<>":"td","html":"${Country}"},
        {"<>":"td","html":"${AQI_IN}"},
        {"<>":"td","html":"${PM25}"},
        {"<>":"td","html":"${PM10}"},
        {"<>":"td","html":"${Temp}"},
        {"<>":"td","html":"${Humidity}"},
        {"<>":"td","html":"${Time}"}
    ]
};

const regiterUser = async function (req, res) {
    try {
        let { firstName, lastName, email, password, dateOfBirth } = req.body;
        firstName = firstName.trim();
        lastName = lastName.trim();
        email = email.toLowerCase().trim();
        password = password.trim();
        dateOfBirth = dateOfBirth.trim();

        if (firstName == "") {
            return res.status(400).send({ status: false, message: "Please provide your first name" });
        }

        if (lastName == "") {
            return res.status(400).send({ status: false, message: "Please provide your last name" });
        }

        if (email == "") {
            return res.status(400).send({ status: false, message: "Please provide your email Id" });
        }

        if (password == "") {
            return res.status(400).send({ status: false, message: "Password cannot be empty" });
        }

        if (dateOfBirth == "") {
            return res.status(400).send({ status: false, message: "Please provide your date of birth" });
        }

        if (!/^[a-zA-Z ]*$/.test(firstName)) {
            return res.status(400).send({ status: false, message: "Please provide valid first name" });
        }

        if (!/^[a-zA-Z]*$/.test(lastName)) {
            return res.status(400).send({ status: false, message: "Please enter valid last name" });
        }

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return res.status(400).send({ status: false, message: "Please provide valid email address" });
        }

        const valueFromDate = new Date(dateOfBirth).getTime();
        console.log(valueFromDate);
        if (!valueFromDate) {
            return res.status(400).send({ status: false, message: "Please enter a relevent date" });
        }

        if (password.length < 8 || password > 15) {
            return res.status(400).send({ status: false, message: "password should be more than 8 characters and less than 15 characters" });
        }

        // check if user already exists
        const checkUser = await userModel.findOne({ email: email });
        // console.log(checkUser);

        if (checkUser) {
            return res.status(400).send({ status: false, message: "User is already registerd" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // console.log(hashedPassword);

        const newUser = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            dateOfBirth
        }

        console.log(newUser);
        const createUser = await userModel.create(newUser);
        return res.status(201).send({ status: 'SUCCESS', message: "SignUp successful", data: createUser });

        // return res.send({status:true,message:"API Working fine"})
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const loginUser = async function (req, res) {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();
        password = password.trim();

        if (!email) {
            return res.status(400).send({ status: false, message: "Please provide your email" });
        }

        if (!password) {
            return res.status(400).send({ status: false, message: "Please provide your password" });
        }

        const findUser = await userModel.findOne({ email: email });
        // console.log(findUser);
        if (!findUser) {
            return res.status(404).send({ status: false, message: "Please register first" });
        }
        const hashedPassword = findUser.password;
        // console.log("hashedPassword",hashedPassword);
        const comparePassword = await bcrypt.compare(password, hashedPassword);
        // console.log(comparePassword);

        if (!comparePassword) {
            return res.status(400).send({ status: false, message: "Invalid password" });
        }
        const fetchData = await aqiModel.find().select({ SerialNo: 1, location: 1, City: 1, State: 1, Country:1, AQI_IN:1, PM25:1, PM10:1, Temp:1,Humidity:1, Time:1, _id:0});
        console.log(fetchData);
        
        // defining a transformation function     
        let table_header = json2html.transform(fetchData[0],template_table_header);
        let table_body = json2html.transform(fetchData,template_table_body);

        let header = '<!DOCTYPE html>' + '<html lang="en">\n' + '<head><title>User Data</title></head>';
        let body = '<h1 style="color:blue;">AQI Data</h1><br><table id="my_table">\n<thead>' + table_header + '\n</thead>\n<tbody>\n' + table_body + '\n</tbody>\n</table>';
        body = '<body>' + body + '</body>';
        let html = header + body + '</html>';
        // let finalHtmlFile = json2html.render(fetchData,template);
        fs.writeFile('json2html.html',html,function(err){
            console.log("HTML file created");
        })
        console.log(html);
        return res.status(200).send({ status: true, message: "Getting all the data from users collection", data:html});
        // return res.status(200).send({status:true,message:"API running successfully"});
    }
    catch (error) {
        return res.status(500).send({ status: error.message });
    }
};

module.exports = { regiterUser, loginUser };