# Integration Testing ReadMe

Note to Z: I used your actions & basics example as a base to create most of this assignment. To test the workflow (green check on gitHub) I followed your instructions.

## Please ignore "main" branch, only assess "master"

... all the talk about "master" being out of favour made me want to try to rename it but it was more complicated than I anticipated. The WORKFLOW check is NOT working on "main" only works on "master".

# Test in VScode

In terminal, use "node --test" and watch the green check marks and blue list pop up.

## Scenario

Design and implement a small Event Check-In and Attendance System, not to build a large application, but to demonstrate: Proper separation of logic and data handling, Unit testing of business rules, Integration testing of system components, Automated testing using GitHub Actions (Continuous Integration).

This lab includes:

- `eventDb.js`: SQLite connection, query helpers, and schema creation
- `eventRepo.js`: SQL data access for courses and enrollments
- `eventService.js`: validation + business logic

## Goal

The system must allow:

### Creating events

    -> event: unique ID, name, date

### Registering attendees

    -> registration: unique attendee.email, attendee.name

### Checking in attendees

    -> attendee MUST BE registered for event

### Generating an attendance report that contains:

    -> Event name
    -> Total registered attendees
    -> Total checked-in
    -> List of checked-in attendees

## Functional Expectations Tested

Tests verify the following:

1. `addEvent` saves a valid event and normalizes `code` to uppercase.

2. `addAttendee` creates registration records for valid input.
3. `addAttendee` rejects registration for a non-existent course.
4. Duplicate enrollment of the same attendee for the same event is rejected.

5. `printAllAttendees` returns students in insertion order.

6. Invalid inputs are rejected with `TypeError` where appropriate.

7. `findEventById` returns event information if eventId exists.
8. `findAttendee` returns attendee information if attendee exists.
9. `checkInAttendee` changes checkedIn status from default 0 to 1 when checked in.
10. `printCheckedInAttendees` returns a CSV file listing each event and attendees.
