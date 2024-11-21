const router = require('express').Router();
const EventRoutes = require("@api/v3/event/routes");

EventRoutes(router);

module.exports = router;