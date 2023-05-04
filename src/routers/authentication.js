import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { fetchData, generateCreateQuery } from "../functions/functions.js";
import buildQueryConditions from "../utilities/query-builder.js";
import createConnection from "../../config/databaseConfig.js";

var connection = createConnection();

const router = Router();

router.post("/register", (req, res) => {
  var par = req.body;
  connection.query(
    `SELECT * FROM student WHERE studentEmail = '${par.studentEmail}'`,
    function (error, results) {
      if (results) {
        console.log(results);
        if (results.length > 0) res.status(400).json("Email already in use.");
        else {
          const salt = crypto.randomBytes(16).toString("hex");
          const hash = crypto
            .pbkdf2Sync(par.studentPassword, salt, 1000, 32, "sha512")
            .toString("hex");
          var data = fetchData({
            // firstName: par.firstname,
            // lastName: par.lastname,
            // phoneNumber: par.phonenumber,
            // dateOfBirth: par.dateOfBirth,
            // universityEmail: par.universityEmail,
            // verifiedDriver: "NULL",
            // campusId: par.campusid,
            // salt,
            // hash,
            studentID: par.studentID,
            studentName: par.studentName,
            studentEmail: par.studentEmail,
            studentPhoneNumber: par.studentPhoneNumber,
            studentPassword: hash.toString(),
            studentSalt: salt,
            studentMainCampus: "beirut",
            studentAddress: null,
            studentRegistrationStatus: "registered",
          });
          const query = generateCreateQuery(data[0], [data[1]], "student");
          connection.query(query, function (error, results) {
            if (results) {
              const userId = results.insertId;
              const accessToken = jwt.sign(
                { userId },
                process.env.ACCESS_TOKEN_SECRET
              );
              console.log(results);
              res.status(200).json({ accessToken, userId });
            } else {
              console.error(error);
            }
          });
        }
        console.log(data);
      } else {
        console.error(error);
      }
    }
  );
});

router.post("/login", (req, res) => {
  var par = req.body;
  var queryConditions = buildQueryConditions(
    ["studentID", par.studentID],
    ["studentEmail", par.studentEmail],
    ["studentSalt", par.studentSalt]
  );
  console.log(par);
  connection.query(
    `SELECT * FROM student${queryConditions}`,
    function (error, results) {
      if (results) {
        if (results.length > 0) {
          let user = results.pop();
          console.log(par);
          const { studentSalt, studentPassword } = user;
          const valid =
            studentPassword ===
            crypto
              .pbkdf2Sync(
                par.studentPassword,
                user.studentSalt,
                1000,
                32,
                "sha512"
              )
              .toString("hex");
          console.log(valid);

          if (!valid) res.status(400).send("Invalid username or password.");
          else {
            const userId = user.ID;
            // const firstName = user.firstName;
            // const lastName = user.lastName;
            const studentName = user.studentName;
            const studentEmail = user.studentEmail;
            const accessToken = jwt.sign(
              { userId, studentName, studentEmail },
              process.env.ACCESS_TOKEN_SECRET
            );
            res.status(200).json({ accessToken, userId, studentName });
          }
        } else res.status(400).send("Invalid username or password.");
      } else {
        console.error(error);
      }
    }
  );
});

router.get("/universities", (req, res) => {
  console.log(req.params);
  connection.query(
    `SELECT ID,name FROM UNIVERSITY `,
    function (error, results) {
      if (results) {
        let universities = results;
        res.json(universities);
      } else {
        console.error(error);
      }
    }
  );
});

router.get("/campuses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const query = `SELECT ID,name FROM CAMPUS WHERE universityId=${id}`;
  connection.query(`${query};`, function (error, results) {
    if (results) {
      res.status(200).json(results);
    } else {
      console.error(error);
    }
  });
});

export default router;