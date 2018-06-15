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

app.get("/scrape", function (req, res) {
    axios.get("https://techcrunch.com/apps/").then(function(response) {
        
        console.log("\n***********************************\n" +
      "Listing recent articles from\n" +
      "TechCrunch's App page:" +
      "\n***********************************\n");
    
        var $ = cheerio.load(response.data);

        var results = [];

        $("post-block").each(function(i, element){
            var result= {};
            console.log(element);

            result.title = $(this).children("header").children("h2").children("a").text();
            result.link = $(this).children("header").children("h2").children("a").attr("href");
            result.summary = $(this).children("div.post-block__content").text();

            console.log(result);
            results.push(result);
            console.log(results)

            db.Headline.create(result)
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
    db.Headline.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});




app.listen(PORT, () => console.log(`Listening on port ${PORT}`));