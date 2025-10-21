const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  summary: String,
  description: String,
  start: Date,
  end: Date,
  attendees: [String], // Correos
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
