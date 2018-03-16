var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
 var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main", layoutsDir:__dirname +'/views/layouts'}));
app.set("view engine", "handlebars");

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes
//var routes = require("./routes/index.js");

//app.use(routes);

app.get("/", function(req, res) {

  res.render("index", {title:'Scraping With Mongoose and HBS',message:'Click button to get new recipes!!'})


});

//A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  
  // First, we grab the body of the html with request
  axios.get("https://www.allrecipes.com/").then(function(response) {
    //request("https://www.allrecipes.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    
    var $ = cheerio.load(response.data);
    arrResults = [];
    // Now, we grab every h2 within an article tag, and do the following:
    $("article.grid-col--fixed-tiles").each(function(i, element) {
    //   console.log(element);
      var recipeName = $(element).children().attr("data-name");
      var image = $(element).children().attr("data-imageurl");
      var link = $(element).children("a").attr("href");
    //   // Save an empty result object
      
    //   // Add the text and href of every link, and save them as properties of the result object
    var result = {}; 
    if(recipeName && image && link){
        result.title = recipeName;
        result.link = link;
        result.image = image;
        arrResults.push(result);
        // Create a new Article using the `result` object built from scraping
        // db.Article.create(result)
        // .then(function(dbArticle) {
        //   // View the added result in the console
        //   for (var i = 0; i < dbArticle.length; i++) {
        //     dbArticle[i].image = dbArticle[i].image.replace(/'/g,"");
        //   }
        //   console.log(dbArticle);
        //   //res.render("index", {title:'Scraping With Mongoose and HBS',message:'Scrape Complete',hbsObject:dbArticle})
        // })
        // .catch(function(err) {
        //   // If an error occurred, send it to the client
        //   return res.json(err);
        // });
      }
      
    });
    
    // If we were able to successfully scrape and save an Article, send a message to the client
    //res.send("Scrape Complete");
    for (var i = 0; i < arrResults.length; i++) {
      arrResults[i].image = arrResults[i].image.replace(/'/g,"");
        }
      console.log(arrResults)
      //update handelbars page with data
        res.render("index", {title:'Scraping With Mongoose and HBS',message:'Scrape Complete',hbsObject:arrResults,script:'/index.js'})
     
    
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
        res.render("article", {title:'Scraping With Mongoose and HBS',hbsObject: dbArticle,script:'/app.js'})


      //res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
app.get("/notes:title", function(req,res){
  console.log('req.params.title')
  console.log(req.params.title)
  db.Note.find({title: req.params.title}).then(function(dbnote) {
        
    console.log(dbnote);
  // bulk.execute(function (err, res) {
    console.log('Done!');
    //console.log(res);
    //console.log(req);
    })

})


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      console.log(dbArticle);
      
      
      console.log(dbArticle.note);
      console.log(dbArticle.note.title);
      // console.log(dbArticle.note.body);
      // var bulk = db.Note.initializeOrderedBulkOp()

      db.Note.find({title: dbArticle.note.title}).then(function(dbnote) {
        console.log("-----------")
        var notes = [];
        for(var i =0;i <dbnote.length; i++){
         notes.push(dbnote[i].body) 
        }
        dbArticle.note.body = notes;
        console.log(dbArticle.note);
       
        //console.log('dbArticle');
        //console.log(dbArticle);
      // bulk.execute(function (err, res) {
        res.json(dbArticle);
        console.log('Done!');
      })
      
      
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
  console.log("app.post(/articles/:id --req.body");
  console.log(req.body);
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      //return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { notes: dbNote._id } }, { new: true });
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

// Route for saving/updating an Article's associated Note
app.post("/favorites", function(req, res) {
  console.log(req.body)
  db.Article.create(req.body)
});

app.post("/removeNote", function(req, res) {
  console.log(req.body)
  
  db.Note.deleteOne(req.body).then(function(dbnote) {
    console.log(dbnote)
  });

});
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
