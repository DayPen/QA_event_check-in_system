// previously Z's enrollmentService.js from Qual2000 - Feb 2026

const {
  addEvent,
  findEventById,
  addAttendee,
  checkInAttendee,
  printAllAttendees,
} = require("./eventRepo");

const validateEvent = (event) => {
  if (!event || typeof event !== "object") {
    throw new TypeError("event must be an object");
  }
  if (typeof event.name !== "string" || event.name.trim() === "") {
    throw new TypeError("event.name must be a NON-empty string");
  }
  if (typeof event.date !== "string" || event.name.trim() === "") {
    throw new TypeError("event.date must be a NON-empty string");
  }
};

const validateAttendee = (attendee) => {
  if (!attendee || typeof attendee !== "object") {
    throw new TypeError("attendee MUST BE an object");
  }
  if (typeof attendee.name !== "string" || attendee.name.trim() === "") {
    throw new TypeError("attendee.name MUST BE a non-empty string");
  }
  if (typeof attendee.email !== "string" || attendee.email.trim() === "") {
    throw new TypeError("attendee.email MUST BE a non-empty string");
  }
};

const createEvent = async (db, event) => {
  validateEvent(event);
  return addEvent(db, {
    name: event.name.trim(),
    date: event.date.trim(),
  });
};

const registerAttendee = async (db, attendee, eventId) => {
  validateAttendee(attendee);

  if (!Number.isInteger(eventId)) {
    throw new TypeError("eventId MUST BE an integer");
  }

  const event = await findEventById(db, eventId);

  if (!event) throw new Error("Event NOT found.");

  return addAttendee(db, {
    name: attendee.name.trim(),
    email: attendee.email.trim(),
    eventId,
  });
};

const checkIn = (db, email, eventId) => {
  if (typeof email !== "string" || email.trim() === "") {
    throw new TypeError("email must be a NON-empty string");
  }

  if (!Number.isInteger(eventId)) {
    throw new TypeError("eventId MUST be an integer");
  }

  checkInAttendee(db, email.trim(), eventId);
};

const getAttendanceInfo = async (db, eventId) => {
  if (!Number.isInteger(eventId))
    throw new TypeError("eventId MUST be an integer");

  const event = await findEventById(db, eventId);
  if (!event) {
    throw new Error("event NOT found");
  }

  const attendees = await printAllAttendees(db, eventId);
  const checkedInList = attendees.filter(
    (attendees) => attendees.checkedIn === 1,
  );
  // default = 0 (not checked in)

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
