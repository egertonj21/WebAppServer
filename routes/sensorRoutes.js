import express from "express";
import { getSensors, logSensorData } from "../controllers/sensorController.js";

const router = express.Router();

export default (connection) => {
    router.get("/", (req, res) => getSensors(connection, req, res));
    router.post("/log", (req, res) => logSensorData(connection, req, res));

    return router;
};
