var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
 var axios = require("axios");
var cheerio = require("cheerio");

var router = express.Router();
// Use morgan logger for logging requests
// Initialize Express
var app = express();
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Import the model (burger.js) to use its database functions.
var app = require("../models/");


//A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.allrecipes.com/").then(function(response) {
    //request("https://www.allrecipes.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article.grid-col--fixed-tiles").each(function(i, element) {
    //   console.log(element);
      var recipeName = $(element).children().attr("data-name");
      var image = $(element).children().attr("data-imageurl");
      var link = $(element).children("a").attr("href");
    //   // Save an empty result object
      var result = {};

    //   // Add the text and href of every link, and save them as properties of the result object
      if(recipeName && image && link){
        result.title = recipeName;
        result.link = link;
        result.image = image;

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
      }
      
    });
    
    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      
      for (var i = 0; i < dbArticle.length; i++) {
        dbArticle[i].image = dbArticle[i].image.replace(/'/g,"");
      }
      console.log(dbArticle);
      // var hbsObject = {
      //   title: dbArticle[0].title,
      //   link: dbArticle[0].link
      // };
       //console.log(hbsObject);
        res.render("index", {title:'Scraping With Mongoose and HBS',hbsObject: dbArticle})


      //res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
      //console.log(dbArticle);
      // console.log(dbArticle.note);
      // console.log(dbArticle.note.title);
      // console.log(dbArticle.note.body);
      // res.render("article-block", {hbsModalObject: dbArticle.note.title});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});