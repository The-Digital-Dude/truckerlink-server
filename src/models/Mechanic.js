const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mechanicSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    certificationNumber: {
      type: String,
      required: [true, 'Certification number is required'],
      unique: true,
      trim: true,
    },
    specializations: [
      {
        type: String,
        trim: true,
      },
    ],
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    shopName: {
      type: String,
      trim: true,
    },
    shopAddress: {
      type: String,
      trim: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      address: {
        type: String,
        trim: true,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    socketId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
mechanicSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
mechanicSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
mechanicSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Create geospatial index for location queries
mechanicSchema.index({ currentLocation: '2dsphere' });

const Mechanic = mongoose.model('Mechanic', mechanicSchema);

module.exports = Mechanic;
