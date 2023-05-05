import { Router } from "express";
import createConnection from "../../config/databaseConfig.js";
import {
  fetchData,
  generateCreateQuery,
  generateDeleteQuery,
} from "../functions/functions.js";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();
var connection = createConnection();

AWS.config.update({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
});

const upload = multer({
  storage: multer.memoryStorage(),
  // file size limitation in bytes
  limits: { fileSize: 52428800 },
});

const router = Router();

router.get("/", (req, res) => {
  connection.query(`SELECT * FROM student`, function (error, results) {
    if (results) {
      var users = results;
      if (users.length > 0) res.status(200).json(users);
      else res.status(404).send("No Users found.");
    } else console.error(error);
  });
});

router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  connection.query(
    `SELECT * FROM student WHERE studentID= ${id}`,
    function (error, results) {
      if (results) {
        var user = results;
        if (user.length > 0) res.status(200).json(user.pop());
        else res.status(404).send("User not found.");
      } else console.error(error);
    }
  );
});

router.patch("/:id", (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  console.log(id);
  connection.query(
    `UPDATE student SET studentName = '${req.body.fullName}', studentPhoneNumber = '${req.body.phoneNumber}', studentAddress = '${req.body.address}' , studentMainCampus = '${req.body.mainCampus}'  WHERE studentID = ${id};`,
    function (error, results) {
      if (results) {
        res.status(200).json({
          // firstName: req.body.firstName,
          // lastName: req.body.lastName,
          fullName: req.body.fullName,
        });
      } else console.error(error);
    }
  );
});

router.post("/photo/:id", (req, res) => {
  //configuring the AWS environment
  var s3bucket = new AWS.S3();
  // Setting up S3 upload parameters
  var buffer = Buffer.from(
    req.body.base64.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const params = {
    Bucket: "profileimages-db",
    ACL: "public-read",
    Key: req.params.id,
    Body: buffer,
    ContentEncoding: "base64",
  };
  s3bucket.putObject(params, async (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: err });
    } else {
      res.status(200).json({
        message: "Upload successful",
      });
    }
  });
});

router.post("/license/:id", (req, res) => {
  const id = parseInt(req.params.id);
  var image = req.body;

  var s3bucket = new AWS.S3();
  // Setting up S3 upload parameters
  const params = {
    Bucket: "licensecard-db",
    ACL: "public-read",
    Key: req.params.id,
    Body: image.uri,
  };

  s3bucket.upload(params, async (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: err });
    } else {
      connection.query(
        `UPDATE student SET verifiedDriver = 'INSERTED' WHERE ID = ${id};`,
        function (error, results) {
          if (results) {
            res.status(200).json("Added license");
          } else {
            console.error(error);
            res.status(400).json("Couldn't add license");
          }
        }
      );
    }
  });
});

router.get("/license/:id", (req, res) => {
  const id = parseInt(req.params.id);
  connection.query(
    `SELECT verifiedDriver FROM student WHERE ID = ${id};`,
    function (error, results) {
      if (results) {
        let drivingLicense = results;
        if (drivingLicense.length > 0)
          res.status(200).json(drivingLicense.pop());
        else res.status(404).send("car not found.");
      } else console.error(error);
    }
  );
});

router.get("/photo/:id", (req, res) => {
  //configuring the AWS environment
  AWS.config.update({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
  });
  var s3bucket = new AWS.S3();

  // Setting up S3 upload parameters
  var params = { Bucket: "profileimages-db", Key: req.params.id };
  s3bucket.getObject(params, function (err, data) {
    if (!err) {
      try {
        const bas64 = data.Body.toString("base64");
        const imgSrc = "data:image/jpeg;base64," + bas64;
        res.status(200).send(imgSrc);
      } catch (e) {
        res.status(400).send(e);
      }
    } else {
      console.error(err);
      res.status(500);
    }
  });
});

router.get("/car/:id", (req, res) => {
  const id = parseInt(req.params.id);

  connection.query(
    `SELECT * FROM CAR WHERE studentId= ${id}`,
    function (error, results) {
      if (results) {
        let car = results;
        if (car.length > 0) res.status(200).json(car.pop());
        else res.status(404).send("car not found.");
      } else console.error(error);
    }
  );
});

router.patch("/car/:id", (req, res) => {
  const id = parseInt(req.params.id);

  connection.query(
    `UPDATE CAR SET model = '${req.body.model}', number = '${req.body.number}', color = '${req.body.color}', description = '${req.body.description}'  WHERE studentId = ${id};`,
    function (error, results) {
      if (results) {
        res.status(200).json(results);
      } else console.error(error);
    }
  );
});

router.post("/car", (req, res) => {
  var par = req.body;
  var data = fetchData(par);
  const query = generateCreateQuery(data[0], [data[1]], "CAR");
  connection.query(query, function (error, results) {
    if (results) res.status(200).json("Added car.");
    else res.status(400).json("Couldn't add car.");
  });
});

router.delete("/car/:id", (req, res) => {
  const id = parseInt(req.params.id);
  var query = generateDeleteQuery(id, "studentId", "CAR");

  connection.query(query, function (error, results) {
    if (results) res.status(200).json("Deleted car.");
    else res.status(400).json("Couldn't delete car.");
  });
});

export default router;
