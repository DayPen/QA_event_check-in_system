// based on Z's test.js from Qual2000 - Feb 2026

const test = require("node:test");
const assert = require("node:assert/strict");
const { createDb, initSchema, closeDb } = require("../eventDb");
const { createEvent, registerAttendee, checkIn } = require("../eventService");
const { printAllAttendees } = require("../eventRepo");

test.describe("Event Check-In System integration", () => {
  let db;

  test.beforeEach(async () => {
    db = createDb();
    await initSchema(db);
  });

  test.afterEach(async () => {
    await closeDb(db);
  });

  test("create an event and register attendee", async () => {
    const saved = await createEvent(db, {
      name: " Birthday Party ",
      date: "2026-05-20",
    });

    assert.ok(saved.id > 0); //for boolean checks
    assert.strictEqual(saved.name, "Birthday Party"); //for equality checks
    assert.strictEqual(saved.date, "2026-05-20");

    const attendee = await registerAttendee(
      db,
      {
        name: " DayDay ",
        email: "day@email.com",
      },
      saved.id,
    );
    assert.ok(attendee.id > 0);
    assert.strictEqual(attendee.name, "DayDay");
    assert.strictEqual(attendee.email, "day@email.com");
  });

  test("registerAttendee rejects duplicate emails (must be unique)", async () => {
    const event = await createEvent(db, {
      name: "StudyGroup",
      date: "2026-03-06",
    });
    await registerAttendee(
      db,
      {
        name: "DayDay",
        email: "day@email.com",
      },
      event.id,
    );
    await assert.rejects(() =>
      registerAttendee(
        db,
        {
          name: "Emmy",
          email: "day@email.com", // same email as DayDay - NOT unique, should FAIL
        },
        event.id,
      ),
    );
  });

  test("checkIn rejects UNREGISTERED attendee", async () => {
    const event = await createEvent(db, {
      name: "TriviaNight",
      date: "2026-03-07",
    });

    await assert.rejects(
      () => checkIn(db, "NOTregistered@email.com", event.id),
      {
        message: "attendee NOT registered",
      },
    );
  });

  test("DUPLICATE registration for the same event is REJECTED", async () => {
    const event = await createEvent(db, {
      name: "Bridal Shower",
      date: "2027-06-11",
    });
    await registerAttendee(
      db,
      {
        name: "DayDay",
        email: "day@email.com",
      },
      event.id,
    );
    await assert.rejects(
      () => registerAttendee(db, { name: "DayDay", email: "day@email.com" }),
      /UNIQUE constraint failed/,
    );
  });

  test("same attendee can register for DIFFERENT events", async () => {
    const event1 = await createEvent(db, {
      name: "StudySession1",
      date: "2026-05-01",
    });
    const event2 = await createEvent(db, {
      name: "StudySession2",
      date: "2026-05-04",
    });

    await registerAttendee(db, "DayDay", "StudySession1");
    await registerAttendee(db, "DayDay", "StudySession2");

    const rosterSS1 = await printAllAttendees(db, "StudySession1");
    const rosterSS2 = await printAllAttendees(db, "StudySession2");

    assert.deepStrictEqual(
      rosterSS1.map((attendee) => attendee.name),
      ["DayDay"],
    );
    assert.deepStrictEqual(
      rosterSS2.map((attendee) => attendee.name),
      ["DayDay"],
    );
  });

  test("invalid inputs throw TypeError", async () => {
    await assert.rejects(() => createEvent(db, { name: "", date: "T" }), {
      name: "TypeError",
    });
    await assert.rejects(
      () => createEvent(db, { name: "HomeComing2026", date: "" }),
      { name: "TypeError" },
    );
    await assert.rejects(
      () => createEvent(db, { name: "HomeComing2026", date: "T" }),
      { name: "TypeError" },
    );

    await createEvent(db, {
      name: "HomeComing2026",
      date: "2026-09-09",
    });

    await assert.rejects(() => registerAttendee(db, "", "HomeComing2026"), {
      name: "TypeError",
    });
    await assert.rejects(() => registerAttendee(db, "DayDay", ""), {
      name: "TypeError",
    });
    assert.throws(() => printAllAttendees(db, ""), {
      name: "TypeError",
    });
  });
});
