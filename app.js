require('dotenv').config();
require("colors");
const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt')
const dhtModel = require('./models/dhtModel.js');

const app = express();

//Socket io
const http = require('http');
const server = http.createServer(app);
const {Server} = require ('socket.io')

const io = new Server(server)

io.on('connection', (socket) => {
    console.log ('A clinet connected'.yellow.underline);
})
  

//connect MongoDB
const mongoString = process.env.DATABASE_URL
mongoose.connect(mongoString);
const connDB = mongoose.connection
connDB.on('error', (error) => {
    console.log(error)
})

connDB.once('open', () => {
    console.log(`MongoDB Connected: ${connDB.host}`.yellow.bold.underline)
})

//connect mqtt
const host = 'broker.emqx.io'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `mqtt://${host}:${port}`

const mqttClient = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: '',
    password: '',
    reconnectPeriod: 1000,
})

const topic = 'CE232.N21.2_PUB'

mqttClient.on('connect', () => {
    console.log('MQTT Connected'.yellow.underline)

    mqttClient.subscribe([topic], () => {
        console.log(`Subscribe to topic '${topic}'`.cyan.underline.bold)
    })
})


mqttClient.on('message', (topic, message) => {
    //message is a Buffer
    let strMessage = message.toString();
    //let objMessage = JSON.parse(strMessage);
    console.log("Receive message:\n", strMessage.blue);
    //Split messsage

    let dataArray = strMessage.split("\n\n");

    // Lấy giá trị Temperature từ phần tử thứ nhất trong mảng
    let temperatureString = dataArray[0].split(":")[1].trim();
    let temperature = parseFloat(temperatureString);
    
    // Lấy giá trị Humidity từ phần tử thứ hai trong mảng
    let humidityString = dataArray[1].split(":")[1].trim();
    let humidity = parseFloat(humidityString);
    
    // Lấy giá trị Weather từ phần tử thứ ba trong mảng
    let weatherString = dataArray[2].split(":")[1].trim();
    let weather = weatherString;


    const dht11 = new dhtModel({
        temp: temperature,
        hum: humidity,
        weather: weather
    });

    dht11.save()
        .then(() => {
            console.log('Data saved to MongoDB'.green.underline.bold);
        })
        .catch((error) => {
            console.error(error);
        });
    
    io.emit('newData', { dht11 });
})

//Web app

app.use(express.json());
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    try {
        const data = await dhtModel
            .findOne()
            .sort({ createdAt: -1 })
            .exec();
        res.render('home', { data });
    } catch (err) {
        console.error('Error retrieving items from MongoDB:', err);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const data = await dhtModel
            .find()
            .sort({ createdAt: -1 })
            .limit(10)
            .exec();
        const reversedData = data.reverse();
        res.json({ data });
    } catch (err) {
        console.error('Error retrieving items from MongoDB:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use(express.static('public')); 

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.blue.underline)
});