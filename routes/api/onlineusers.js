require("dotenv").config();

const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const path = require("path");
const jwt = require("jsonwebtoken");
let date = new Date();

//create Connection
const db = mysql.createConnection({
  host: "146.148.71.201",
  user: "root",
  password: "serverless2",
  port: "3306",
  database: "user",
});

//connect
db.connect((err) => {
  if (err) {
    throw err;
  }
});
console.log("MySQL connected!");

router.post("/", authenticateToken, (req, res) => {
  console.log("Hello");
  
  // console.log("body", req.body);
  if (!req.body.email) {
    return res.status(400).json({ msg: `Please include emailid` });
  }

  //State Table Operations
  let where = " email = ?";
  let values = [req.result.email];
  let sqlSelectState = "SELECT * FROM userstate WHERE" + where;

  //Data Table Operations
  //   let whereIsNot = " email != ?";
  let sqlOnlineUsersData =
    "SELECT data.name FROM userdata data, userstate state WHERE state.state = 'online' && data.email = state.email && state.email != ?;";

  let querySelectData = db.query(sqlSelectState, values, (err, entry) => {
    // console.log("hi qw");

    if (err) {
      throw err;
    }
    if (entry.length === 0) {
      res.status(404).json({
        msg: `Invalid Request! Unauthenticated User! Please Login first!`,
      });
    } else if (entry[0].logout_timestmp !== null) {
      res.status(404).json({ msg: `Invalid Request! Please Login first!` });
    } else {
      console.log("Authenticated User!");

      let queryOnlineUsers = db.query(
        sqlOnlineUsersData,
        values,
        (err, onlineUsers) => {
          res
            .status(200)
            .json({ onlineUsers: onlineUsers.map((obj) => obj.name) });
        }
      );
    }
  });
});

 function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(`token check: ${token}`);

  let sqlSelectState = "SELECT * FROM userstate WHERE token = ?";

  if (token == null) {
    return res.status(401);
  }

  let querySelectState = db.query(sqlSelectState, token, (err, stateEntry) => {
    if (err) {
      throw err;
    }
    // console.log("hi");
    console.log(`length:`, stateEntry[0]);
    console.log(`lengthTokrn:`, token);
    
    if (stateEntry[0] === undefined) {
      return res.status(404).json({
        msg: `Invalid Request! Unauthenticated User! Please Login first!`,
      });
    }
    // console.log("hi");

    try {
      let result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);      
        req.result = result;
        // console.log(req.body);
        
        // console.log("result");

        next();
    } catch (err) {
      console.log(err);
      return res.status(403);
    }
    
  });
   
}

module.exports = router;
