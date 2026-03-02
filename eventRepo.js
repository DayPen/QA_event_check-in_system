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
    ...event,
  };
};

const findEventById = (db, eventId) => {
  return get(db, "SELECT id, name, date FROM events WHERE code = ?", [eventId]);
};

const addAttendee = async (db, attendee) => {
  const result = await get(
    db,
    "INSERT INTO attendees (name, email, event_id) VALUES (?, ?, ?)",
    [attendee.name, attendee.email, attendee.eventId],
  );
  return { id: result.lastID, ...attendee, checkedIn: 0 };
};

const findAttendee = async (db, email, eventId) => {
  get(
    db,
    "SELECT id, name, email, checked_in AS checkedIn FROM attendees where email = ? AND event_id = ?",
    [email, eventId],
  );
};

const checkInAttendee = async (db, email, eventId) => {
  const attendee = await findAttendee(db, email, eventId);
  if (!attendee) throw Error("Attendee NOT registered.");
  await run(db, "UPDATE attendees SET checked_in = 1 WHERE id = ?", [
    attendee.id,
  ]);
  return attendee;
};

const printCheckedInAttendees = (db, eventId) =>
  all(
    db,
    "SELECT name, email FROM attendees WHERE event_id = ? AND checked_in = 1",
    [eventId],
  );

const printAllAttendees = (db, eventId) =>
  all(
    db,
    "SELECT name, email, checked_in AS checkedIn from attendees WHERE event_id = ?",
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
