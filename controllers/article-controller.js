const express = require("express");
const router = express.Router();
const headline = require("../models");

router.get("/", function(req, res){
    headline.find(function(data){
        var handlebarsObject = {
            articles: data
        };
        console.log(handlebarsObject);
        res.render("index", handlebarsObject);
    });
});

// router.post("/api/articles", function(req, res){
//     headline.create([
//         "burger_name", "devoured"
//     ], [
//         req.body.burger_name, req.body.devoured
//     ], function(result){
//         res.json({id: result.insertId});
//     });
// });

router.put("/api/articles/:id", function(req, res){
    var condition = `id = ${req.params.id}`;

    console.log("condition", condition);

    headline.update({
        saved: req.body.saved
    }, condition, function(result){
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            res.status(200).end();
        }
    });
});

router.delete("/api/articles/:id", function(req, res){
    var condition = `id = ${req.params.id}`;
    
    headline.delete(condition, function(result){
        if (result.affectedRows == 0){
            return res.status(404).end();
        } else {
            res.status(200).end();
        }
    });
});


module.exports = router;