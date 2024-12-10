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

// Event Routes
app.get("/events/published", async (req, res) => {
   try {
      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);
      const publishedEvents = eventsData.events.filter(
         (e) => !e.hasOwnProperty("published") || e.published
      );

      const { groupBy, search } = req.query;

      const events = search
         ? filterBySearch(publishedEvents, search)
         : publishedEvents;

      if (groupBy) {
         const groupedEvents = groupEventsBy(events, groupBy);
         return res.status(200).json({ events: groupedEvents });
      }

      res.status(200).json({ events });
   } catch (error) {
      res.status(500).json({
         message: "Failed to fetch events",
         error: error.message,
      });
   }
});

app.get("/events/all", async (req, res) => {
   try {
      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);

      const { groupBy, search } = req.query;

      const events = search
         ? filterBySearch(eventsData.events, search)
         : eventsData.events;

      if (groupBy) {
         const groupedEvents = groupEventsBy(events, groupBy);
         return res.status(200).json({ events: groupedEvents });
      }

      res.status(200).json({ events });
   } catch (error) {
      res.status(500).json({
         message: "Failed to fetch events",
         error: error.message,
      });
   }
});

app.get("/events/:registrationId", async (req, res) => {
   try {
      const registrationId = req.params.registrationId;
      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);

      const event = eventsData.events.find(
         (e) => e.registrationid === registrationId
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

app.post("/events", async (req, res) => {
   try {
      const event = req.body.event;

      if (!event || !event.title || !event.registrationid) {
         return res.status(422).json({
            message:
               "Invalid event data, required fields: [title, registrationid]",
         });
      }

      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);

      // Generate new ID
      const maxId = Math.max(
         ...eventsData.events.map((e) => parseInt(e.id)),
         0
      );
      const newEvent = {
         ...event,
         id: String(maxId + 1),
      };

      const updatedEvents = {
         events: [...eventsData.events, newEvent],
      };

      await fs.writeFile(
         "./data/events.json",
         JSON.stringify(updatedEvents, null, 2)
      );

      res.status(201).json({ message: "Event created!", event: newEvent });
   } catch (error) {
      res.status(500).json({
         message: "Failed to create event",
         error: error.message,
      });
   }
});

app.put("/events/:eventId", async (req, res) => {
   try {
      const eventId = req.params.eventId;
      const event = req.body.event;

      if (!event || !event.title || !event.registrationid) {
         return res.status(422).json({
            message:
               "Invalid event data, required fields: [title, registrationid]",
         });
      }

      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);
      const eventExists = eventsData.events.some(
         (e) => String(e.id) === eventId
      );

      if (!eventExists) {
         return res.status(404).json({ message: "Event not found" });
      }

      const updatedEvents = {
         events: eventsData.events.map((e) =>
            String(e.id) === eventId ? { ...e, ...event } : e
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

app.delete("/events/:eventId", async (req, res) => {
   try {
      const eventId = req.params.eventId;

      const fileContent = await fs.readFile("./data/events.json");
      const eventsData = JSON.parse(fileContent);
      const eventExists = eventsData.events.some(
         (e) => String(e.id) === eventId
      );

      if (!eventExists) {
         return res.status(404).json({ message: "Event not found" });
      }

      const updatedEvents = {
         events: eventsData.events.filter((e) => String(e.id) !== eventId),
      };

      await fs.writeFile(
         "./data/events.json",
         JSON.stringify(updatedEvents, null, 2)
      );

      res.status(200).json({ message: "Event deleted!" });
   } catch (error) {
      res.status(500).json({
         message: "Failed to delete event",
         error: error.message,
      });
   }
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

app.put("/admin", async (req, res) => {
   try {
      const admin = req.body.admin;

      if (!admin || !admin.username || !admin.password) {
         return res.status(422).json({
            message:
               "Invalid admin data, required fields: [username, password]",
         });
      }

      const fileContent = await fs.readFile("./data/admin.json");
      const adminData = { ...JSON.parse(fileContent), ...admin };
      await fs.writeFile(
         "./data/admin.json",
         JSON.stringify(adminData, null, 2)
      );

      res.status(200).json({ message: "Admin User updated!" });
   } catch (error) {
      res.status(500).json({
         message: "Failed to update admin",
         error: error.message,
      });
   }
});

// Helper Functions
function groupEventsBy(events, key) {
   return events.reduce((acc, event) => {
      const group = event[key];
      if (!acc[group]) {
         acc[group] = [];
      }
      acc[group].push(event);
      return acc;
   }, {});
}

function filterBySearch(events, search) {
   const searchLower = search.toLowerCase();
   return events.filter((event) => {
      // Search in main event fields
      const mainFields = [
         event.title,
         event.description,
         event.location,
         event.date,
         event.time,
      ].filter(Boolean);

      // Search in segments if they exist
      const segmentFields = event.segments
         ? event.segments
              .flatMap((segment) => [
                 segment.title,
                 segment.description,
                 segment.date,
                 segment.time,
              ])
              .filter(Boolean)
         : [];

      const allSearchableFields = [...mainFields, ...segmentFields];

      return allSearchableFields.some((field) =>
         String(field).toLowerCase().includes(searchLower)
      );
   });
}

// 404 Handler
app.use((req, res) => {
   res.status(404).json({ message: "404 - Not Found" });
});

module.exports = app;
