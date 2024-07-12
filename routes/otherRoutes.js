import express from "express";
import {
    getActions,
    getRanges,
    getNotes,
    getNoteDetails,
    updateRange,
    getSensorLight,
    getSensorLightById,
    createSensorLight,
    updateSensorLightColour,
    getSelectedOutput,
    updateSelectedOutput,
    getLightDurations,
    createLightDuration,
    getColours,
    getLogs,
    getSensorStatus,
    getAllSensorAwakeInfo,
    updateSensorStatus,
    getMute,
    updateMute,
} from "../controllers/otherControllers.js";

const router = express.Router();

export default (connection) => {
    router.get("/actions", (req, res) => getActions(connection, req, res));
    router.get("/ranges", (req, res) => getRanges(connection, req, res));
    router.get("/notes", (req, res) => getNotes(connection, req, res));
    router.get("/note-details/:sensor_ID/:range_ID", (req, res) => getNoteDetails(connection, req, res));
    router.put("/range/:range_ID", (req, res) => updateRange(connection, req, res));
    router.get("/sensor-light", (req, res) => getSensorLight(connection, req, res));
    router.get("/sensor-light/:id", (req, res) => getSensorLightById(connection, req, res));
    router.post("/sensor-light", (req, res) => createSensorLight(connection, req, res));
    router.put("/sensor-light/:LED_strip_ID/:range_ID", (req, res) => updateSensorLightColour(connection, req, res));
    router.get("/selected-output/:sensor_ID", (req, res) => getSelectedOutput(connection, req, res));
    router.post("/selected-output/:sensor_ID", (req, res) => updateSelectedOutput(connection, req, res));
    router.get("/light-durations", (req, res) => getLightDurations(connection, req, res));
    router.post("/light-duration", (req, res) => createLightDuration(connection, req, res));
    router.get("/colours", (req, res) => getColours(connection, req, res));
    router.get("/logs", (req, res) => getLogs(connection, req, res));
    router.get("/sensor-status", (req, res) => getSensorStatus(connection, req, res));
    router.get("/sensorsAwake", (req, res) => getAllSensorAwakeInfo(connection, req, res));
    router.post("/sensor-status", (req, res) => updateSensorStatus(connection, req, res));
    router.get("/mute", (req, res) => getMute(connection, req, res));
    router.post("/mute", (req, res) => updateMute(connection, req, res));

    return router;
};
