import { Router } from "express";
import { users } from "../utilities/mock-data.js";
import createConnection from "../../config/databaseConfig.js";
import {
    fetchData,
    generateCreateQuery,
    generateDeleteQuery,
} from "../functions/functions.js";
var connection = createConnection();
const router = Router();


router.get("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    connection.query(
        `SELECT * FROM NOTIFICATION WHERE studentId= ${id}`,
        function(error, results) {
            if (results) {
                res.status(200).json(results);
            } else console.error(error);
        }
    );
});

router.patch("/:id", (req, res) => {
    connection.query(
        `UPDATE NOTIFICATION SET name = ${req.body.name}, message = ${req.body.message} WHERE ID = ${req.body.studentId};`,
        function(error, results) {
            if (results) {
                res.send(200).json(results);
            } else console.error(error);
        }
    )
})

router.post("/", (req, res) => {
    var par = req.body;
    var data = fetchData(par);
    const query = generateCreateQuery(data[0], [data[1]], "NOTIFICATION");
    connection.query(query, function(error, results) {
        if (results) res.status(201).json("Requested a ride.");
        else res.status(400).json("Failed to request a ride.");
    });
});

router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    var query = generateDeleteQuery(id, "ID", "NOTIFICATION");

    connection.query(query, function(error, results) {
        if (results) {
            console.log(results)
        } else {
            console.error(error);
        }
    });
    res.status(200).json("Deleted notification");

});

export default router;