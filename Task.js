const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['düşük', 'orta', 'yüksek'], default: 'orta' },
    tags: { type: [String], default: [] },
    completedAt: { type: Date },
    deadline: { type: Date }, // 📌 🆕 Görev için son tarih eklendi
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
