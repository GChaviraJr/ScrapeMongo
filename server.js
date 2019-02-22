const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

// = Middleware (pass everything through the logger first) ================================================
	app.use(logger('dev'));
	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use(express.static('public')); // (create a public folder and land there)

// = Database configuration ================================================
	mongoose.connect('mongodb://localhost/mongoosescraper');
	var db = mongoose.connection;

	db.on('error', function (err) {
		console.log('Mongoose Error: ', err);
	});
	db.once('open', function () {
		console.log('Mongoose connection successful.');
	});

	const Note = require('./models/Note.js');
	const Article = require('./models/Article.js');

// = Routes ================================================================
	app.get('/', function(req, res) {
	  res.send(index.html); // sending the html file rather than rendering a handlebars file
	});

app.get('/scrape', function(req, res) {
  axios('http://www.echojs.com/', function(error, response, html) {
    let $ = cheerio.load(html);
    $('article h2').each(function(i, element) {

				let result = {};

				result.title = $(this).children('a').text();
				result.link = $(this).children('a').attr('href');

				let entry = new Article (result);

				entry.save(function(err, doc) {
				  if (err) {
				    console.log(err);
				  } else {
				    console.log(doc);
				  }
				});


    });
  });
  res.send("Scrape Complete");
});


app.get('/articles', function(req, res){
	Article.find({}, function(err, doc){
		if (err){
			console.log(err);
		} else {
			res.json(doc);
		}
	});
});


app.get('/articles/:id', function(req, res){
	Article.findOne({'_id': req.params.id})
	.populate('note')
	.exec(function(err, doc){
		if (err){
			console.log(err);
		} else {
			res.json(doc);
		}
	});
});


app.post('/articles/:id', function(req, res){
	let newNote = new Note(req.body);

	newNote.save(function(err, doc){
		if(err){
			console.log(err);
		} else {
			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			.exec(function(err, doc){
				if (err){
					console.log(err);
				} else {
					res.send(doc);
				}
			});

		}
	});
});








app.listen(3008, function() {
  console.log('App running on port 3008!');
});