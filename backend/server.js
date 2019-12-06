const mongoose = require("mongoose");
const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
//const Data = require("./data");
const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

const path = require("path");
const fs = require("fs");

///insert data to mongo db

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
router.post("/putData", (req, ress) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("fullstack_app");

    const { name, descriptors } = req.body;
    var myobj = {
      name: name,
      descriptors: descriptors
    };

    dbo.collection("recognition").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

router.get("/getData", (req, res) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("fullstack_app");
    dbo
      .collection("recognition")
      .find({})
      .toArray(function(err, result) {
        if (err) throw err;

        let JSON_PROFILE = new Object();
        result.map(item => {
          let key = item.name;
          let profile = new Object();
          profile[key] = item;

          JSON_PROFILE = { ...JSON_PROFILE, ...profile };
        });
        console.log(".......................................................");
        console.log(result.length);
        if (result.length == 0) {
          const JSON_PROFILE = require("./bnk48.json");

          return res.json({ success: true, data: { JSON_PROFILE } });
        } else {
          return res.json({ success: true, data: { JSON_PROFILE } });
        }

        db.close();
      });
  });

  // return res.json({ success: false, data: { JSON_PROFILE } });
});

app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
