const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Cors ayarlarının yapılmasını saglar
app.use(express.json()); // json formatına dönüstürür.

// MongoDB Bağlantısı
mongoose.connect('mongodb://localhost:27017/todo', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Rotaları Bağlama
const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes);

// Basit Sunucu Kontrolü
app.get('/', (req, res) => {
  res.send('To-Do List API Çalışıyor!');
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
