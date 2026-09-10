const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS Settings - Allow all origins
app.use(cors({ origin: '*' }));
app.use(express.json());

// MongoDB Fast Serverless Connection
const MONGO_URI = process.env.MONGO_URI;
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (MONGO_URI) {
    const db = await mongoose.connect(MONGO_URI);
    isConnected = db.connections[0].readyState;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database Connection Failed" });
  }
});

// Schemas
const ServiceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  imageUrl: String
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  category: String,
  techStack: String,
  imageUrl: String
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