const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI; // Vercel-এর Environment Variable-এ সেট করবেন
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));
}

// Mongo Schemas
const ServiceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String, // Web, Academic, Marketing
  icon: String
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  category: String,
  techStack: String,
  image: String
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

// Admin Passkey Middleware (Simple Protection)
const ADMIN_KEY = process.env.ADMIN_KEY || "regnons123";
const authAdmin = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key === ADMIN_KEY) return next();
  res.status(401).json({ error: "Unauthorized Access" });
};

// --- ROUTES ---

// Services Endpoints
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

// Projects Endpoints
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

// Inquiry / Contact Endpoints
app.post('/api/contact', async (req, res) => {
  const newInquiry = new Inquiry(req.body);
  await newInquiry.save();
  res.json({ message: "Message sent successfully!" });
});

app.get('/api/inquiries', authAdmin, async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  res.json(inquiries);
});

module.exports = app;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));