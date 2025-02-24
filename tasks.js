const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Tüm görevleri listele
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    console.log(tasks);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Yeni görev oluştur
router.post('/', async (req, res) => {
  console.log('Gelen veri:', req.body);

  const task = new Task({
    title: req.body.title,
    priority: req.body.priority,
    completed: req.body.completed || false,
    completedAt: req.body.completed ? new Date() : null,
    tags: req.body.tags || [],
    createdAt: new Date()
  });

  try {
    const newTask = await task.save();
    console.log('Yeni görev eklendi:', newTask);
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Görev eklenemedi:', err);
    res.status(400).json({ message: err.message });
  }
});

// Görev güncelleme
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });

    if (req.body.title != null) task.title = req.body.title;
    if (req.body.priority != null) task.priority = req.body.priority;
    
    if (req.body.completed != null) {
      task.completed = req.body.completed;
      task.completedAt = req.body.completed ? new Date() : null;
    }

    if (req.body.tags != null) task.tags = req.body.tags;
    if (req.body.createdAt != null) task.createdAt = req.body.createdAt;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Görev silme
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });

    res.json({ message: 'Görev silindi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Görevleri filtreleme ve sıralama
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.completed) filter.completed = req.query.completed === 'true';
    if (req.query.priority) filter.priority = req.query.priority;
    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Etiket ekleme
router.patch('/:id/tags', async (req, res) => {
  try {
    const { tags } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });
    task.tags = tags;
    await task.save();
    res.json({ message: 'Etiketler güncellendi', task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Etikete göre filtreleme
router.get('/filter', async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) return res.status(400).json({ message: 'Lütfen bir etiket girin' });
    const tasks = await Task.find({ tags: tag });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
