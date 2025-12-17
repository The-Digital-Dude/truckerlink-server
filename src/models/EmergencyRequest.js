const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver reference is required'],
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mechanic',
      default: null,
    },
    problemType: {
      type: String,
      required: [true, 'Problem type is required'],
      enum: [
        'engine',
        'tire',
        'brake',
        'electrical',
        'fuel',
        'transmission',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    vehicleInfo: {
      type: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
      },
      year: {
        type: Number,
      },
      plateNumber: {
        type: String,
        trim: true,
      },
    },
    estimatedArrival: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
emergencyRequestSchema.index({ location: '2dsphere' });

// Index for efficient querying
emergencyRequestSchema.index({ status: 1, createdAt: -1 });
emergencyRequestSchema.index({ driver: 1, createdAt: -1 });
emergencyRequestSchema.index({ mechanic: 1, createdAt: -1 });

const EmergencyRequest = mongoose.model(
  'EmergencyRequest',
  emergencyRequestSchema
);

module.exports = EmergencyRequest;
