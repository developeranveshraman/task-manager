const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

const FILE = 'tasks.json';

app.use(cors());
app.use(express.json());

// Get all tasks
app.get('/tasks', (req, res) => {
  fs.readFile(FILE, (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

// Add new task
app.post('/tasks', (req, res) => {
  const { text, username } = req.body;
  if (!text || !username) return res.status(400).json({ error: "Text and username required" });

  fs.readFile(FILE, (err, data) => {
    let tasks = [];
    if (!err) tasks = JSON.parse(data);
    tasks.push({ text, done: false, username });
    fs.writeFile(FILE, JSON.stringify(tasks), () => {
      res.status(201).json({ message: 'Task added' });
    });
  });
});

// Mark task as done
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(FILE, (err, data) => {
    if (err) return res.status(500).json({ error: "Can't read file" });
    let tasks = JSON.parse(data);
    if (!tasks[id]) return res.status(404).json({ error: "Task not found" });
    tasks[id].done = true;
    fs.writeFile(FILE, JSON.stringify(tasks), () => {
      res.json({ message: 'Task updated' });
    });
  });
});

// Delete task (admin only)
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(FILE, (err, data) => {
    if (err) return res.status(500).json({ error: "Can't read file" });
    let tasks = JSON.parse(data);
    if (!tasks[id]) return res.status(404).json({ error: "Task not found" });
    tasks.splice(id, 1);
    fs.writeFile(FILE, JSON.stringify(tasks), () => {
      res.json({ message: 'Task deleted' });
    });
  });
});

// API: Check server status
app.get('/server-status', (req, res) => {
  res.json({
    online: true,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
