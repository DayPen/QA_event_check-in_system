// previously Z's courseRepo.js from Qual2000 - Feb 2026

const { run, get, all } = require("./eventDb");

const addEvent = async (db, event) => {
  const result = await run(
    db,
    "INSERT INTO events (name, date) VALUES (?, ?)",
    [event.name, event.date],
  );

  return {
    id: result.lastID,
    name: event.name,
    date: event.date,
  };
};

const findEventById = (db, eventId) => {
  return get(db, "SELECT id, name, date FROM events WHERE id = ?", [eventId]);
};

const addAttendee = async (db, attendee) => {
  const result = await run(
    db,
    "INSERT INTO attendees (name, email, event_id) VALUES (?, ?, ?)",
    [attendee.name, attendee.email, attendee.eventId],
  );
  return {
    id: result.lastID,
    name: attendee.name,
    email: attendee.email,
    eventId: attendee.eventId,
    checkedIn: 0, // defaulting to NOT checked in
  };
};

const findAttendee = async (db, email, eventId) => {
  return get(
    db,
    "SELECT id, name, email, checked_in AS checkedIn FROM attendees where email = ? AND event_id = ?",
    [email, eventId],
  );
};

const checkInAttendee = async (db, email, eventId) => {
  const attendee = await findAttendee(db, email, eventId);
  if (!attendee) {
    throw new Error("attendee NOT registered.");
  }
  await run(db, "UPDATE attendees SET checked_in = 1 WHERE id = ?", [
    attendee.id,
  ]);
  return { ...attendee, checkedIn: 1 }; // no longer 0 (false)
};

const printAllAttendees = (db, eventId) =>
  all(
    db,
    "SELECT name, email, checked_in AS checkedIn from attendees WHERE event_id = ? ORDER BY id",
    [eventId],
  );

module.exports = {
  addEvent,
  findEventById,
  addAttendee,
  findAttendee,
  checkInAttendee,
  printCheckedInAttendees,
  printAllAttendees,
};
