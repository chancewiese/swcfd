// backend/app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("node:fs/promises");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
   bodyParser.json({
      verify: (req, res, buf, encoding) => {
         if (req.method === "DELETE") {
            return false;
         }
      },
   })
);
app.use(bodyParser.urlencoded({ extended: true }));

// CORS and Headers
app.use((req, res, next) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
   );
   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

   // Handle preflight
   if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
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

      const fileContent = await fs.readFile("./data/events.json", "utf8");
      const eventsData = JSON.parse(fileContent);
      const event = eventsData.events.find((e) => e.id === eventId);

      if (!event) {
         return res.status(404).json({ message: "Event not found" });
      }

      // Find the highest existing segment number and add 1
      const existingIds = event.segments.map((s) =>
         parseInt(s.id.split("-")[1])
      );
      const nextNum = Math.max(0, ...existingIds) + 1;

      // Create new segment with sequential ID
      const newSegment = {
         id: `${eventId}-${nextNum}`,
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
   console.log("Attempting to delete segment:", req.params);

   try {
      // Read the current events data
      const data = await fs.readFile("./data/events.json", "utf8");
      const eventsData = JSON.parse(data);

      // Find the event and update its segments
      eventsData.events = eventsData.events.map((event) => {
         if (event.id === req.params.eventId) {
            return {
               ...event,
               segments: event.segments.filter(
                  (segment) => segment.id !== req.params.segmentId
               ),
            };
         }
         return event;
      });

      // Write the updated data back to file
      await fs.writeFile(
         "./data/events.json",
         JSON.stringify(eventsData, null, 2)
      );

      res.json({ message: "Segment deleted successfully" });
   } catch (error) {
      console.error("Error deleting segment:", error);
      res.status(500).json({ message: "Error deleting segment" });
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

// Add this to your existing registration routes in app.js
app.put("/registrations/:registrationId/:id", async (req, res) => {
   try {
      const registrationId = req.params.registrationId;
      const id = req.params.id;
      const updatedData = req.body.registration;

      const fileContent = await fs.readFile("./data/registrations.json");
      const registrationsData = JSON.parse(fileContent);

      if (!registrationsData.registrations[registrationId]) {
         return res
            .status(404)
            .json({ message: "Registration type not found" });
      }

      const registrationIndex = registrationsData.registrations[
         registrationId
      ].registrants.findIndex((r) => r.id === id);

      if (registrationIndex === -1) {
         return res.status(404).json({ message: "Registration not found" });
      }

      // Update registration while preserving id and timestamp
      registrationsData.registrations[registrationId].registrants[
         registrationIndex
      ] = {
         ...registrationsData.registrations[registrationId].registrants[
            registrationIndex
         ],
         ...updatedData,
         id, // Preserve the original ID
      };

      await fs.writeFile(
         "./data/registrations.json",
         JSON.stringify(registrationsData, null, 2)
      );

      res.status(200).json({
         message: "Registration updated successfully",
         registration:
            registrationsData.registrations[registrationId].registrants[
               registrationIndex
            ],
      });
   } catch (error) {
      res.status(500).json({
         message: "Failed to update registration",
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
   console.log("Attempting to delete registration:", req.params);

   try {
      // Read the current registrations data
      const data = await fs.readFile("./data/registrations.json", "utf8");
      const registrationsData = JSON.parse(data);

      // Get the specific registration type and filter out the registrant
      if (registrationsData.registrations[req.params.registrationId]) {
         registrationsData.registrations[
            req.params.registrationId
         ].registrants = registrationsData.registrations[
            req.params.registrationId
         ].registrants.filter((registrant) => registrant.id !== req.params.id);

         // Write the updated data back to file
         await fs.writeFile(
            "./data/registrations.json",
            JSON.stringify(registrationsData, null, 2)
         );

         res.json({ message: "Registration deleted successfully" });
      } else {
         res.status(404).json({ message: "Registration type not found" });
      }
   } catch (error) {
      console.error("Error deleting registration:", error);
      res.status(500).json({ message: "Error deleting registration" });
   }
});

// 404 Handler
app.use((req, res) => {
   res.status(404).json({ message: "404 - Not Found" });
});

module.exports = app;
