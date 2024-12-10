// backend/app.js
const fs = require("node:fs/promises");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// CORS and Headers
app.use((req, res, next) => {
   res.setHeader("Content-Type", "application/json");
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
   if (req.method === "OPTIONS") {
      return res.status(204).end();
   }
   next();
});

// Admin Routes
app.get("/admin", async (req, res) => {
   try {
      const fileContent = await fs.readFile("./data/admin.json");
      const admin = JSON.parse(fileContent);
      res.status(200).json({ admin });
   } catch (error) {
      res.status(500).json({
         message: "Failed to fetch admin data",
         error: error.message,
      });
   }
});

// Event Routes
app.get("/events/all", async (req, res) => {
   try {
      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);
      res.status(200).json({ events: eventsData.events });
   } catch (error) {
      res.status(500).json({
         message: "Failed to fetch events",
         error: error.message,
      });
   }
});

app.get("/events/registration/:registrationId", async (req, res) => {
   try {
      const registrationId = req.params.registrationId;
      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);

      const event = eventsData.events.find(
         (e) => e.registrationId === registrationId
      );

      if (!event) {
         return res.status(404).json({ message: "Event not found" });
      }

      res.status(200).json({ event });
   } catch (error) {
      res.status(500).json({
         message: "Failed to fetch event",
         error: error.message,
      });
   }
});

app.put("/events/:eventId", async (req, res) => {
   try {
      const eventId = req.params.eventId;
      const event = req.body.event;

      if (!event || !event.title) {
         return res.status(422).json({
            message: "Invalid event data, required fields: [title]",
         });
      }

      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);
      const eventExists = eventsData.events.some((e) => e.id === eventId);

      if (!eventExists) {
         return res.status(404).json({ message: "Event not found" });
      }

      // Update the event while preserving other events
      const updatedEvents = {
         events: eventsData.events.map((e) =>
            e.id === eventId ? { ...e, ...event } : e
         ),
      };

      await fs.writeFile(
         "./data/events.json",
         JSON.stringify(updatedEvents, null, 2)
      );

      res.status(200).json({ message: "Event updated!" });
   } catch (error) {
      res.status(500).json({
         message: "Failed to update event",
         error: error.message,
      });
   }
});

// Add a new segment to an event
app.post("/events/:eventId/segments", async (req, res) => {
   try {
      const eventId = req.params.eventId;
      const segment = req.body.segment;

      if (!segment || !segment.title || !segment.date || !segment.time) {
         return res.status(422).json({
            message:
               "Invalid segment data, required fields: [title, date, time]",
         });
      }

      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);
      const event = eventsData.events.find((e) => e.id === eventId);

      if (!event) {
         return res.status(404).json({ message: "Event not found" });
      }

      // Generate new segment ID
      const newSegment = {
         id: `${eventId}-${Date.now()}`,
         ...segment,
      };

      // Add segment to event
      event.segments = event.segments || [];
      event.segments.push(newSegment);

      await fs.writeFile(
         "./data/events.json",
         JSON.stringify(eventsData, null, 2)
      );

      res.status(201).json({
         message: "Segment added!",
         segment: newSegment,
      });
   } catch (error) {
      res.status(500).json({
         message: "Failed to add segment",
         error: error.message,
      });
   }
});

// Delete a segment from an event
app.delete("/events/:eventId/segments/:segmentId", async (req, res) => {
   try {
      const { eventId, segmentId } = req.params;

      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);
      const event = eventsData.events.find((e) => e.id === eventId);

      if (!event) {
         return res.status(404).json({ message: "Event not found" });
      }

      // Remove segment
      event.segments = event.segments.filter((s) => s.id !== segmentId);

      await fs.writeFile(
         "./data/events.json",
         JSON.stringify(eventsData, null, 2)
      );

      res.status(200).json({ message: "Segment deleted!" });
   } catch (error) {
      res.status(500).json({
         message: "Failed to delete segment",
         error: error.message,
      });
   }
});

// Registration Routes
app.get("/registrations/:registrationId", async (req, res) => {
   try {
      const fileContent = await fs.readFile("./data/registrations.json");
      const registrationsData = JSON.parse(fileContent);
      const registrationId = req.params.registrationId;

      const registrations = registrationsData.registrations[registrationId] || {
         registrants: [],
      };

      res.status(200).json(registrations);
   } catch (error) {
      res.status(500).json({
         message: "Failed to fetch registrations",
         error: error.message,
      });
   }
});

app.post("/registrations/:registrationId", async (req, res) => {
   try {
      const registrationId = req.params.registrationId;
      const registration = req.body.registration;

      const fileContent = await fs.readFile("./data/registrations.json");
      const registrationsData = JSON.parse(fileContent);

      if (!registrationsData.registrations[registrationId]) {
         registrationsData.registrations[registrationId] = { registrants: [] };
      }

      const newRegistration = {
         id: `${registrationId}-${Date.now()}`,
         timestamp: new Date().toISOString(),
         ...registration,
      };

      registrationsData.registrations[registrationId].registrants.push(
         newRegistration
      );

      await fs.writeFile(
         "./data/registrations.json",
         JSON.stringify(registrationsData, null, 2)
      );

      res.status(201).json({
         message: "Registration created!",
         registration: newRegistration,
      });
   } catch (error) {
      res.status(500).json({
         message: "Failed to create registration",
         error: error.message,
      });
   }
});

app.delete("/registrations/:registrationId/:id", async (req, res) => {
   try {
      const { registrationId, id } = req.params;

      const fileContent = await fs.readFile("./data/registrations.json");
      const registrationsData = JSON.parse(fileContent);

      if (!registrationsData.registrations[registrationId]) {
         return res
            .status(404)
            .json({ message: "Registration type not found" });
      }

      const registrants =
         registrationsData.registrations[registrationId].registrants;
      const index = registrants.findIndex((r) => r.id === id);

      if (index === -1) {
         return res.status(404).json({ message: "Registration not found" });
      }

      registrants.splice(index, 1);

      await fs.writeFile(
         "./data/registrations.json",
         JSON.stringify(registrationsData, null, 2)
      );

      res.status(200).json({ message: "Registration deleted!" });
   } catch (error) {
      res.status(500).json({
         message: "Failed to delete registration",
         error: error.message,
      });
   }
});

// 404 Handler
app.use((req, res) => {
   res.status(404).json({ message: "404 - Not Found" });
});

module.exports = app;
