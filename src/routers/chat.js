import { Router } from "express";
import createConnection from "../../config/databaseConfig.js";
import { fetchData, generateCreateQuery } from "../functions/functions.js";
import { connectedUsers } from "../../config/websocketConfig.js";

var connection = createConnection();
const router = Router();
router.get("/getAllChats/:id", (req, res) => {
  const studentId = req.params.id;
  try {
    connection.query(
      `SELECT Z.ID, driverId, driverFirstName, driverLastName, riderId, firstName as riderFirstName, lastName as riderLastName, message, date FROM STUDENT JOIN
      (SELECT Y.ID, firstName as driverFirstName, lastName as driverLastName, driverId, riderId, message, date FROM STUDENT JOIN
      (SELECT X.ID, X.studentId AS riderId, RIDE.studentId AS driverId, message, date FROM RIDE JOIN
      (SELECT CHAT.ID, rideId, CHAT.studentId, message, date FROM CHAT, MESSAGE WHERE MESSAGE.chatId = CHAT.ID
      AND MESSAGE.date = (SELECT MAX(date) FROM MESSAGE GROUP BY chatId HAVING chatId = CHAT.ID)) X
      ON RIDE.ID = X.rideId WHERE RIDE.studentId = ${studentId} OR X.studentId = ${studentId}) Y
      ON STUDENT.ID = Y.driverId) Z
      ON STUDENT.ID = Z.riderId ORDER BY date DESC;`,
      function (error, results) {
        if (results) {
          const output = results.map((result) => {
            const fetchedDate = new Date(result.date);
            fetchedDate.setMinutes(
              fetchedDate.getMinutes() - fetchedDate.getTimezoneOffset()
            );
            return {
              ...result,
              date: fetchedDate.toISOString(),
            };
          });
          res.status(200).json(output);
        } else {
          res.status(400).json("Unable to fetch chats.");
          console.error(error);
        }
      }
    );
  } catch (e) {
    console.error(e);
  }
});

router.get("/:id", (req, res) => {
  const chatId = req.params.id;
  try {
    connection.query(
      `SELECT * FROM MESSAGE WHERE chatId = ${chatId} ORDER BY date DESC`,
      function (error, results) {
        if (results) {
          const output = results.map((result) => {
            const fetchedDate = new Date(result.date);
            fetchedDate.setMinutes(
              fetchedDate.getMinutes() - fetchedDate.getTimezoneOffset()
            );
            return {
              ...result,
              date: fetchedDate.toISOString(),
            };
          });
          res.status(200).json(output);
        } else {
          res.status(400).json("Could not get chat.");
          console.error(error);
        }
      }
    );
  } catch (e) {
    console.error(e);
  }
});

router.post("/", (req, res) => {
  var { rideId, isDriver, driverId, riderId, firstName, date, receiverId } =
    req.body;
  var data = fetchData({ rideId, studentId: riderId });
  const query = generateCreateQuery(data[0], [data[1]], "CHAT");
  connection.query(query, function (error, results) {
    if (results) {
      const messageQueryParams = fetchData({
        studentId: isDriver ? driverId : riderId,
        chatId: results.insertId,
        message: `${firstName} initiated chat.`,
        date,
      });
      const query2 = generateCreateQuery(
        messageQueryParams[0],
        [messageQueryParams[1]],
        "MESSAGE"
      );
      connection.query(query2, function (error, results) {
        if (results) {
          try {
            connectedUsers[receiverId.toString()].send(
              JSON.stringify({ type: "UPDATE_CHATS", content: "" })
            );
          } catch (e) {}
          res.status(200).json("Successfully created chat.");
        } else {
          res.status(400).json("Unable to create chat.");
          console.error(error);
        }
      });
    } else {
      res.status(400).json("Unable to create chat.");
      console.error(error);
    }
  });
});

router.post("/sendMessage", (req, res) => {
  var { studentId, chatId, message, receiverId, date } = req.body;
  var data = fetchData({
    studentId,
    chatId,
    message,
    date,
  });
  const query = generateCreateQuery(data[0], [data[1]], "MESSAGE");
  connection.query(query, function (error, results) {
    if (results) {
      try {
        connectedUsers[receiverId.toString()].send(
          JSON.stringify({ type: "UPDATE_CHATS", content: "" })
        );
      } catch (e) {}
      res.status(201).json(results);
    } else {
      res.status(400).json("Could not send message.");
      console.error(error);
    }
  });
});

export default router;
