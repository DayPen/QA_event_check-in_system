// based on Z's test.js from Qual2000 - Feb 2026

const test = require("node:test");
const assert = require("node:assert/strict");
const { createDb, initSchema, closeDb } = require("../eventDb");
const {
  createEvent,
  registerAttendee,
  checkIn,
  getAttendanceInfo,
} = require("../eventService");
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

  // //////////////////////////////////////////////////////////////////
  // unit test #1: create an event and register attendee
  // //////////////////////////////////////////////////////////////////
  test("create an event and register attendee", async () => {
    const event = await createEvent(db, {
      name: " Birthday Party ",
      date: "2026-05-20",
    });

    assert.ok(event.id > 0); //make sure an id was assigned
    assert.strictEqual(event.name, "Birthday Party"); //name was trimmed
    assert.strictEqual(event.date, "2026-05-20"); // date was stored

    const attendee = await registerAttendee(
      db,
      {
        name: " DayDay ",
        email: "day@email.com",
      },
      event.id,
    );
    assert.ok(attendee.id > 0); //make sure an id was assigned
    assert.strictEqual(attendee.name, "DayDay");
    assert.strictEqual(attendee.email, "day@email.com");
  });
  // //////////////////////////////////////////////////////////////////
  // unit test #2: registerAttendee rejects duplicate emails on SAME EVENT
  // //////////////////////////////////////////////////////////////////
  test("registerAttendee rejects duplicate emails on SAME EVENT", async () => {
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
    await assert.rejects(
      () =>
        registerAttendee(
          db,
          {
            name: "Emmy",
            email: "day@email.com", // email NOT unique to event, should FAIL
          },
          event.id,
        ),
      { message: "Info rec'd NOT UNIQUE to this event" },
    );
  });
  // //////////////////////////////////////////////////////////////////
  // unit test #3: checkIn rejects UNREGISTERED attendee
  // //////////////////////////////////////////////////////////////////
  test("checkIn rejects UNREGISTERED attendee", async () => {
    await assert.rejects(() => checkIn(db, "notRegistered@email.com", 1), {
      message: "attendee NOT registered.",
    });
  });
  // //////////////////////////////////////////////////////////////////
  //unit test #4: DUPLICATE registration for the same event is REJECTED
  // //////////////////////////////////////////////////////////////////
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
      () =>
        registerAttendee(
          db,
          { name: "DayDay", email: "day@email.com" }, // already registered
          event.id,
        ),
      { message: "Info rec'd NOT UNIQUE to this event" },
    );
  });
  // //////////////////////////////////////////////////////////////////
  // unit test #5: invalid inputs throw TypeError
  // //////////////////////////////////////////////////////////////////
  test("invalid inputs throw TypeError", async () => {
    await assert.rejects(() => createEvent(db, { name: "", date: "" }), {
      name: "TypeError",
    });
    await assert.rejects(
      () => createEvent(db, { name: "HomeComing2026", date: "" }),
      {
        name: "TypeError",
      },
    );
    await assert.rejects(
      () => createEvent(db, { name: "", date: "2026-09-09" }),
      { name: "TypeError" },
    );

    await assert.rejects(() => registerAttendee(db, "", 1), {
      name: "TypeError",
    });
    await assert.rejects(
      () => registerAttendee(db, { name: "DayDay", email: "" }, 1),
      { name: "TypeError" },
    );
    await assert.rejects(() => getAttendanceInfo(db, ""), {
      name: "TypeError",
    });
  });

  // /////////////////////////////////////////////////////////////////////
  // Integration test 1: same attendee can register for DIFFERENT events
  // /////////////////////////////////////////////////////////////////////
  test("same attendee can register for DIFFERENT events", async () => {
    const event1 = await createEvent(db, {
      name: "StudySession1",
      date: "2026-05-01",
    });
    const event2 = await createEvent(db, {
      name: "StudySession2",
      date: "2026-05-04",
    });

    await registerAttendee(
      db,
      { name: "DayDay", email: "day@email.com" },
      event1.id,
    );
    await registerAttendee(
      db,
      { name: "DayDay", email: "day@email.com" },
      event2.id,
    );

    const rosterSS1 = await printAllAttendees(db, event1.id);
    const rosterSS2 = await printAllAttendees(db, event2.id);

    assert.deepStrictEqual(
      rosterSS1.map((attendee) => attendee.name),
      ["DayDay"],
    );
    assert.deepStrictEqual(
      rosterSS2.map((attendee) => attendee.name),
      ["DayDay"],
    );
  });

  // //////////////////////////////////////////////////////////////////////////
  // Integration test 2: check-in allows REGISTERED attendee to check-in
  // //////////////////////////////////////////////////////////////////////////
  test("registered attendee can check in successfully", async () => {
    const event = await createEvent(db, {
      name: "TacoTuesday",
      date: "2026-03-03",
    });

    await registerAttendee(
      db,
      { name: "Teddy", email: "ted@email.com" },
      event.id,
    );

    await checkIn(db, "ted@email.com", event.id);
    const attendees = await printAllAttendees(db, event.id);
    const teddy = attendees.find(
      (attendee) => attendee.email === "ted@email.com",
    );

    assert.strictEqual(teddy.checkedIn, 1); // 0 = NOT, 1 = IS checked-in
  });

  // /////////////////////////////////////////////////////////////////////
  // Integration test 3: getAttendanceInfo returns stats
  // /////////////////////////////////////////////////////////////////////
  test("getAttendanceInfo returns correct info", async () => {
    const event = await createEvent(db, {
      name: "Spring Fling",
      date: "2026-05-15",
    });
    // registering 3 attendees for the event
    await registerAttendee(
      db,
      { name: "John", email: "jo@email.com" },
      event.id,
    );
    await registerAttendee(
      db,
      { name: "Betty", email: "bet@email.com" },
      event.id,
    );
    await registerAttendee(
      db,
      { name: "Ted", email: "ted@email.com" },
      event.id,
    );
    // checking in only one of registered attendees
    await checkIn(db, "jo@email.com", event.id);

    const eventInfo = await getAttendanceInfo(db, event.id);
    // ensure numbers calculated on attendanceInfo are as expected
    assert.strictEqual(eventInfo.eventName, "Spring Fling");
    assert.strictEqual(eventInfo.totalRegistered, 3);
    assert.strictEqual(eventInfo.totalCheckedIn, 1);
  });
});
