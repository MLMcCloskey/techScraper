// Require Dependencies

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");
const PORT = 3000;
const app = express();


// Set-up Express

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



// Set-up MongoDB

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


// Routes

app.get("/", ()=> res.send("Hello World!"))

app.get("/scrape", function (req, res) {
    axios.get("https://techcrunch.com/apps/").then(function(response) {
        
        console.log("\n***********************************\n" +
            "Listing recent articles from\n" +
            "TechCrunch's App page:" +
            "\n***********************************\n");
    
        var $ = cheerio.load(response.data);

        // console.log(response.data);
        // var results = [];

        $("div.post-block").each(function(i, element){
            var result= {};
            console.log(element);

            result.title = $(this).children("header").children("h2").children("a").text();
            result.link = $(this).children("header").children("h2").children("a").attr("href");
            result.summary = $(this).children("div.post-block__content").text();

            console.log(result);
            results.push(result);
            console.log(results)

            db.mongoHeadlines.create(result)
                .then(function(dbHeadlines){
                    console.log(dbHeadlines);
                })
                .catch(function(err){
                    return res.json(err);
                });
        });

        res.send("Skkkkkrrrrrrpd");

    });
});


app.get("/articles", function (req, res) {
    db.mongoHeadlines.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.mongoHeadlines.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("Note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
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
        return db.mongoHeadlines.findOneAndUpdate({ _id: req.params.id }, { Note: dbNote._id }, { new: true });
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


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));