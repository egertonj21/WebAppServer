import express from "express";
import { getSensors, logSensorData, updateSensorStatus, fetchSensorRanges, fetchLightDuration } from "../controllers/sensorController.js";

const router = express.Router();

export default (connection) => {
    router.get("/", (req, res) => getSensors(connection, req, res));
    router.post("/log", (req, res) => logSensorData(connection, req, res));
    router.post("/update_status", (req, res) => updateSensorStatus(connection, req, res));
    router.get("/ranges", (req, res) => fetchSensorRanges(connection, req, res));
    router.get("/light_duration", (req, res) => fetchLightDuration(connection, req, res));

    return router;
};
