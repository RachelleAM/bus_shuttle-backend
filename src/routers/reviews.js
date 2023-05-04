import { Router } from "express";
import createConnection from "../../config/databaseConfig.js";
import buildQueryConditions from "../utilities/query-builder.js";
import {
  fetchData,
  generateCreateQuery,
  generateDeleteQuery,
} from "../functions/functions.js";
import formatUTCDate from "../utilities/format-date.js";

var connection = createConnection();
const router = Router();

router.post("/", (req, res) => {
  var par = req.body;
  const reviewDetails = {
    ...par,
    date: formatUTCDate(new Date()),
  };
  var data = fetchData(reviewDetails);
  const query = generateCreateQuery(data[0], [data[1]], "REVIEW");
  connection.query(query, function (error, results) {
    if (results) {
      res.status(200).json({ studentId: par.studentId });
    } else {
      console.error(error);
      res.status(400).json("Error adding review.");
    }
  });
});

router.get("/overview/:studentId", (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const query = `SELECT AVG(rating) AS average, COUNT(*) AS count FROM REVIEW JOIN RIDE
                ON REVIEW.rideId = RIDE.ID WHERE RIDE.studentId = ${studentId}`;
  connection.query(`${query};`, function (error, results) {
    if (results) {
      res.status(200).json(results.pop());
    } else res.status(400).send("Error");
  });
});

router.get("/", (req, res) => {
  var queryConditions = buildQueryConditions(
    ["ID", req.query.ID],
    ["studentId", req.query.studentId],
    ["rideID", req.query.rideId]
  );
  var query = `SELECT * FROM REVIEW ${queryConditions} ORDER BY date`;
  if (req.query.studentId)
    query = `SELECT R.ID as reviewId, R.*, S.firstName, S.lastName FROM REVIEW R, STUDENT S, RIDE D WHERE R.rideId = D.ID AND R.studentId = S.ID AND D.studentID = ${req.query.studentId} ORDER BY R.date DESC`;
  connection.query(`${query};`, function (error, results) {
    if (results) {
      if (results.length > 0) {
        res.status(200).json(results);
      } else res.status(404).send("No Review Found.");
    } else {
      console.error(error);
    }
  });
});

router.delete("/:id", (req, res) => {
  var id = req.params.id;
  var query = generateDeleteQuery(id, "ID", "REVIEW");
  connection.query(query, function (error, results) {
    if (results) {
      console.log(results);
    }
  });
  res.status(200).json("Deleted review");
});

router.get("/comments", (req, res) => {
  const { reviewId } = req.query;
  var queryConditions = buildQueryConditions(["reviewID", req.query.reviewId]);
  var query = `SELECT * FROM COMMENT ${queryConditions} ORDER BY date;`;
  if (reviewId) {
    query = `SELECT COMMENT.ID as commentId, COMMENT.*, STUDENT.firstName, STUDENT.lastName FROM COMMENT JOIN STUDENT ON STUDENT.ID = COMMENT.studentId WHERE reviewID = ${reviewId}`;
  }
  connection.query(query, function (error, results) {
    if (results) {
      let output = results;
      res.json(output);
    } else {
      console.error(error);
    }
  });
});

router.post("/comments", (req, res) => {
  var par = req.body;
  var data = fetchData({
    ...par,
    date: formatUTCDate(new Date()),
  });
  const query = generateCreateQuery(data[0], [data[1]], "COMMENT");
  connection.query(query, function (error, results) {
    if (results) {
      res.status(200).json({ reviewId: par.reviewId });
    } else {
      console.error(error);
      res.status(400).json("Error adding comment.");
    }
  });
});

router.get("/comments/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const query = `SELECT * FROM COMMENT WHERE id = ${id}`;
  connection.query(`${query};`, function (error, results) {
    if (results) {
      let comment = results;
      if (comment.length > 0) res.status(200).json(comment.pop());
      else res.status(404).send("Stop request not found.");
    } else console.error(error);
  });
});

router.delete("/comments/:id", (req, res) => {
  var id = req.params.id;
  var query = generateDeleteQuery(id, "ID", "COMMENT");
  connection.query(query, function (error, results) {
    if (results) {
      console.log(results);
    }
  });
  res.status(200).json("Deleted stop request");
});

export default router;
