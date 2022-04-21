require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongo = ('mongodb');
const mongoose = require('mongoose')
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const { json } = require('express/lib/response');
const app = express();
const shortid = require('shortid');
const Schema = mongoose.Schema

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true});

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));


// Your first API endpoint
var ShortUrl = mongoose.model('ShortUrl', new Schema({ 
  short_url: String,
  original_url: String,
  suffix: String 
}));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/", (req, res) => {
  let client_requested_url = req.body.url
  let suffix = shortid.generate();
  let newShortURL = suffix
  let newURL = new ShortUrl({
    short_url: "/api/shorturl/" + suffix,
    original_url: client_requested_url,
    suffix: suffix
  });
  newURL.save((err, doc) => {
    if (err) return console.log(err);
    res.json({
      "saved": true,
      "short_url": newURL.short_url,
      "original_url": newURL.original_url,
      "suffix": newURL.suffix
    });
  });
});

app.get("/api/shorturl/:suffix", (req, res) => {
  let userGeneratedSuffix = req.params.suffix;
  ShortUrl.find({suffix: userGeneratedSuffix}).then(foundUrls => {
    let urlForRedirect = foundUrls[0];
    res.redirect(urlForRedirect.original_url)
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
