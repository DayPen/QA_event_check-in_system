// based on Z's test.js from QUAL2000 - Feb 2026

const test = require("node:test");
const assert = require("node:assert/strict");
const { createDb, initSchema, closeDb } = require("../eventDb");
const { createEvent, registerAttendee, checkIn } = require("../eventService");
const { printAllAttendees } = require("../eventRepo");

// unit test #1: createEvent rejects em
