require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    const defaultData = {
      personal: {
        name: "Your Name",
        title: "Web Developer",
        bio: "I build awesome websites.",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        email: "you@example.com",
        phone: "+1 (555) 123-4567",
        resumeLink: "#"
      },
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com"
      },
      projects: [
        {
          id: "1",
          title: "My Project",
          description: "Description here",
          image: "https://via.placeholder.com/400x250",
          demoLink: "#",
          sourceLink: "#"
        }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

app.get('/api/portfolio', (req, res) => {
  const data = readData();
  res.json({
    personal: data.personal,
    social: data.social,
    projects: data.projects
  });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/admin/data', authenticateToken, (req, res) => {
  res.json(readData());
});

app.put('/api/admin/personal', authenticateToken, (req, res) => {
  const data = readData();
  data.personal = { ...data.personal, ...req.body };
  writeData(data);
  res.json({ success: true });
});

app.put('/api/admin/social', authenticateToken, (req, res) => {
  const data = readData();
  data.social = { ...data.social, ...req.body };
  writeData(data);
  res.json({ success: true });
});

app.post('/api/admin/projects', authenticateToken, (req, res) => {
  const data = readData();
  const newProject = { id: Date.now().toString(), ...req.body };
  data.projects.push(newProject);
  writeData(data);
  res.json({ success: true, project: newProject });
});

app.put('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const data = readData();
  const index = data.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  data.projects[index] = { ...data.projects[index], ...req.body };
  writeData(data);
  res.json({ success: true });
});

app.delete('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const data = readData();
  data.projects = data.projects.filter(p => p.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});