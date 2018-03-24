'user strict';

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

// make mongoose use global.Promise;
mongoose.Promise = global.Promise;

// require PORT and DATABASE_URL from config.js
const { PORT, DATABASE_URL } = require('./config');
// require user, appointment from model.js
const { user, appointment } = require('./models');

const app = express();
app.use(bodyParser.json());

// We need to connect to DB first before we run code on server;
mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
});



app.get('/appointments', (req, res) => {
	console.log("get is connected");
	res.send("hello world!");
});

app.post('/appointments', (req, res) => {
	console.log("connected");
	const requireFields = ['name', 'starttime', 'location', 'duration', 'rate', 'available', 'requester', 'taker', 'createdtime'];
	for(let i = 0; i < requireFields.length; i++) {
		const field = requireFields[i];
		if(!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	appointment
		.create({
			name: req.body.name,
			starttime: req.body.starttime,
			location: req.body.location,
			duration: req.body.duration,
			rate: req.body.rate,
			available: req.body.available,
			requester: req.body.requester,
			taker: req.body.taker,
			createdtime: req.body.createdtime
		})
		.then(appointment => res.status(201).json(appointment.serialize()))
		.catch(err => {
			// question, why do we need to log the error and also use res.status(500) to print in the browser?
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		})



});



app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
      });