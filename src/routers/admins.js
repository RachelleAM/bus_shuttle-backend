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
  connection.query(`SELECT * FROM administrator`, function (error, results) {
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
    `SELECT * FROM administartor WHERE adminID= ${id}`,
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
    `UPDATE administrator SET adminName = '${req.body.fullName}', adminPhoneNumber = '${req.body.phoneNumber}', adminAddress = '${req.body.address}'   WHERE adminID = ${id};`,
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
export default router;
