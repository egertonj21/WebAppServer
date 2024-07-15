import express from "express";
import { updateLEDStrip, getLEDStrips, updateLedStripStatus, fetchLedStripId, fetchColourRgb } from "../controllers/ledstripControllers.js";

const router = express.Router();

export default (connection) => {
    router.put("/:id", (req, res) => updateLEDStrip(connection, req, res));
    router.get("/", (req, res) => getLEDStrips(connection, req, res));
    router.put("/update_status", (req, res) => updateLedStripStatus(connection, req, res));
    router.get("/id/:led_strip_name", (req, res) => fetchLedStripId(connection, req, res));
    router.get("/colour_rgb/:led_strip_id/:range_id", (req, res) => fetchColourRgb(connection, req, res));

    return router;
};
