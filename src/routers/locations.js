import { Router } from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import createConnection from "../../config/databaseConfig.js";

var connection = createConnection();
dotenv.config();

const router = Router();
const GOOGLE_MAPS_KEY = process.env.MAPS_API_KEY;

router.get("/suggestions/:location", async (req, res) => {
  const { location } = req.params;
  const { isUniversity } = req.query;
  try {
    if (JSON.parse(isUniversity)) {
      connection.query(
        `SELECT name AS description FROM CAMPUS;`,
        function (error, results) {
          if (results) {
            const output = results.filter(({ description }) =>
              description.toLowerCase().includes(location.toLowerCase())
            );
            res.status(200).json(output);
          } else res.status(400).send(error);
        }
      );
    } else {
      const result = await fetch(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" +
          location +
          "&components=country:lb" +
          "&key=" +
          GOOGLE_MAPS_KEY
      ).then((res) => res.json());

      res.json(result.predictions);
    }
  } catch (e) {
    console.error(e);
    res.status(400).send("Invalid request.");
  }
});

router.get("/coordinates/:address", async (req, res) => {
  const { address } = req.params;
  try {
    const result = await fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        address +
        "&key=" +
        GOOGLE_MAPS_KEY
    ).then((res) => res.json());

    res.json(result.results[0].geometry.location);
  } catch (e) {
    res.status(400).json("Invalid location");
  }
});

router.get("/nameFromCoords/:coordinates", async (req, res) => {
  const { coordinates } = req.params;
  try {
    const { latitude, longitude } = JSON.parse(coordinates);
    const result = await fetch(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=1000&location=" +
        latitude +
        "," +
        longitude +
        "&key=" +
        GOOGLE_MAPS_KEY
    ).then((res) => res.json());

    res.json(result.results[0].name);
  } catch (e) {
    res.status(400).json("Invalid location");
  }
});

router.get("/possibleRoutes", async (req, res) => {
  const {
    start_id = "ChIJ-Ylp-M0QHxURZtOZgiymDpI",
    destination_id = "ChIJi7oiX0hbHxURmrRW3kLWd7c",
  } = req.query;

  const url =
    "https://maps.googleapis.com/maps/api/directions/json?origin=place_id:" +
    start_id +
    "&destination=place_id:" +
    destination_id +
    "&alternatives=true" +
    "&key=" +
    GOOGLE_MAPS_KEY;

  const result = await fetch(url).then((res) => res.json());

  res.json(result);
});

export default router;
