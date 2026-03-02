// previously Z's enrollmentService.js from Qual2000 - Feb 2026

const {
  addEvent,
  findEventById,
  addAttendee,
  findAttendee,
  checkInAttendee,
  printCheckedInAttendees,
  printAllAttendees,
} = require("./eventRepo");

const validateEvent = (event) => {
  if (!event || typeof event !== "object") {
    throw new TypeError("event must be an object");
  }
  if (typeof event.name !== "string" || event.name.trim() === "") {
    throw new TypeError("event.name must be a non-empty string");
  }
};

const validateAttendee = (attendee) => {
  if (typeof attendee !== "string" || attendee.trim() === "") {
    throw new TypeError("attendee must be a non-empty string");
  }
};

const createEvent = async (db, event) => {
  validateEvent(event);
  return addEvent(db, {
    code: event.name.trim().toUpperCase(),
    title: event.date.trim(),
  });
};

const registerAttendee = async (db, attendee, eventId) => {
  validateAttendee(attendee);
  const event = await findEventById(db, eventId);
  if (!event) throw Error("Event NOT found.");
  return addAttendee(db, { ...attendee, eventId });
};

const checkIn = (db, email, eventId) => checkInAttendee(db, email, eventId);

const getAttendanceInfo = async (db, eventId) => {
  const event = await findEventById(db, eventId);
  if (!event) throw Error("Event NOT found.");
  const attendees = await printAllAttendees(db, eventId);
  const checkedInList = attendees.filter((a) => a.checkedIn);
  return {
    eventName: event.name,
    totalRegistered: attendees.length,
    totalCheckedIn: checkedInList.length,
    checkedInAttendees: checkedInList,
  };
};

module.exports = {
  createEvent,
  registerAttendee,
  checkIn,
  getAttendanceInfo,
};
