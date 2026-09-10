const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

// Optimized MongoDB Connection for Vercel Serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing in Vercel Environment Variables");
  }

  // Set Mongoose connection options for fast failover
  mongoose.set('strictQuery', false);
  
  const db = await mongoose.connect(MONGO_URI, {
    bufferCommands: false, // Turn off buffering so it fails fast instead of hanging 10s
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout
  });

  cachedDb = db;
  return db;
}

// Middleware to connect to DB on every request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    return res.status(500).json({ error: "Database Connection Failed", details: err.message });
  }
});


// Schemas
const ServiceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  imageUrl: String,
  externalLink: String
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  category: String,
  techStack: String,
  imageUrl: String,
  externalLink: String
});

const InquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  projectType: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);

const ADMIN_KEY = process.env.ADMIN_KEY || "regnons123";

const authAdmin = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key === ADMIN_KEY) return next();
  res.status(401).json({ error: "Unauthorized" });
};

// --- ROUTES ---

app.get('/api/services', async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

app.post('/api/services', authAdmin, async (req, res) => {
  const newService = new Service(req.body);
  await newService.save();
  res.json({ message: "Service added successfully", newService });
});

app.put('/api/services/:id', authAdmin, async (req, res) => {
  await Service.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Service updated" });
});

app.delete('/api/services/:id', authAdmin, async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: "Service deleted" });
});

app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.post('/api/projects', authAdmin, async (req, res) => {
  const newProject = new Project(req.body);
  await newProject.save();
  res.json({ message: "Project added", newProject });
});

app.put('/api/projects/:id', authAdmin, async (req, res) => {
  await Project.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Project updated" });
});

app.delete('/api/projects/:id', authAdmin, async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
});

app.post('/api/contact', async (req, res) => {
  const newInquiry = new Inquiry(req.body);
  await newInquiry.save();
  res.json({ message: "Inquiry saved successfully!" });
});

app.get('/api/inquiries', authAdmin, async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  res.json(inquiries);
});

module.exports = app;