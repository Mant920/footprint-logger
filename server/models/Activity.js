const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['transport', 'food', 'energy', 'other']
  },
  co2Amount: {
    type: Number,
    required: true,
    min: [0, 'CO2 amount cannot be negative']
  },
  quantity: {
    type: Number,
    default: 1,
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 200
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Virtual: total CO2 for this entry
activitySchema.virtual('totalCO2').get(function() {
  return this.co2Amount * this.quantity;
});

activitySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Activity', activitySchema);
