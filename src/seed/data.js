/**
 * Seed data for the TruckerLink API.
 *
 * Every account below is created with the same password, taken from the
 * SEED_PASSWORD environment variable (see `.env.example`). Passwords are
 * hashed automatically by the Mongoose `pre('save')` hooks on each model,
 * so they are stored here in plain text intentionally.
 *
 * Coordinates use GeoJSON order: [longitude, latitude].
 */

const users = [
  {
    email: 'admin@truckerlink.com',
    firstName: 'Ada',
    lastName: 'Admin',
    role: 'superuser',
    isActive: true,
  },
  {
    email: 'jane.doe@truckerlink.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'user',
    isActive: true,
  },
  {
    email: 'john.smith@truckerlink.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'user',
    isActive: true,
  },
];

const drivers = [
  {
    email: 'mike.driver@truckerlink.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    phone: '+1-555-0101',
    licenseNumber: 'DL-1001-TX',
    licenseExpiry: new Date('2028-06-30'),
    vehicleType: 'Semi-Truck',
    currentLocation: {
      type: 'Point',
      coordinates: [-95.3698, 29.7604], // Houston, TX
      address: '1200 Smith St, Houston, TX 77002',
    },
    isActive: true,
  },
  {
    email: 'sara.driver@truckerlink.com',
    firstName: 'Sara',
    lastName: 'Williams',
    phone: '+1-555-0102',
    licenseNumber: 'DL-1002-CA',
    licenseExpiry: new Date('2027-11-15'),
    vehicleType: 'Box Truck',
    currentLocation: {
      type: 'Point',
      coordinates: [-118.2437, 34.0522], // Los Angeles, CA
      address: '500 S Grand Ave, Los Angeles, CA 90071',
    },
    isActive: true,
  },
  {
    email: 'carlos.driver@truckerlink.com',
    firstName: 'Carlos',
    lastName: 'Ramirez',
    phone: '+1-555-0103',
    licenseNumber: 'DL-1003-AZ',
    licenseExpiry: new Date('2029-03-01'),
    vehicleType: 'Flatbed',
    currentLocation: {
      type: 'Point',
      coordinates: [-112.074, 33.4484], // Phoenix, AZ
      address: '100 N Central Ave, Phoenix, AZ 85004',
    },
    isActive: true,
  },
];

const mechanics = [
  {
    email: 'tom.mechanic@truckerlink.com',
    firstName: 'Tom',
    lastName: 'Baker',
    phone: '+1-555-0201',
    certificationNumber: 'ASE-2001',
    specializations: ['engine', 'transmission', 'brake'],
    yearsOfExperience: 12,
    shopName: 'Bakers Truck Repair',
    shopAddress: '2100 Navigation Blvd, Houston, TX 77003',
    currentLocation: {
      type: 'Point',
      coordinates: [-95.3419, 29.7521], // Houston, TX
      address: '2100 Navigation Blvd, Houston, TX 77003',
    },
    isAvailable: true,
    isActive: true,
  },
  {
    email: 'nina.mechanic@truckerlink.com',
    firstName: 'Nina',
    lastName: 'Patel',
    phone: '+1-555-0202',
    certificationNumber: 'ASE-2002',
    specializations: ['electrical', 'tire', 'fuel'],
    yearsOfExperience: 8,
    shopName: 'Patel Fleet Services',
    shopAddress: '3400 Wilshire Blvd, Los Angeles, CA 90010',
    currentLocation: {
      type: 'Point',
      coordinates: [-118.2917, 34.0619], // Los Angeles, CA
      address: '3400 Wilshire Blvd, Los Angeles, CA 90010',
    },
    isAvailable: true,
    isActive: true,
  },
  {
    email: 'greg.mechanic@truckerlink.com',
    firstName: 'Greg',
    lastName: 'Nguyen',
    phone: '+1-555-0203',
    certificationNumber: 'ASE-2003',
    specializations: ['brake', 'engine', 'other'],
    yearsOfExperience: 15,
    shopName: 'Desert Diesel Works',
    shopAddress: '850 W Buckeye Rd, Phoenix, AZ 85007',
    currentLocation: {
      type: 'Point',
      coordinates: [-112.0912, 33.4372], // Phoenix, AZ
      address: '850 W Buckeye Rd, Phoenix, AZ 85007',
    },
    isAvailable: false,
    isActive: true,
  },
];

/**
 * Emergency requests are linked to drivers/mechanics at seed time.
 * Reference them by array index via `driverIndex` / `mechanicIndex`
 * (mechanicIndex may be null for still-pending requests).
 */
const emergencyRequests = [
  {
    driverIndex: 0,
    mechanicIndex: null,
    problemType: 'tire',
    description: 'Blown rear tire on the shoulder of I-10 eastbound.',
    location: {
      type: 'Point',
      coordinates: [-95.3612, 29.7499],
      address: 'I-10 E near Exit 770, Houston, TX',
    },
    status: 'pending',
    priority: 'high',
    vehicleInfo: {
      type: 'Semi-Truck',
      model: 'Freightliner Cascadia',
      year: 2021,
      plateNumber: 'TX-TRK-1001',
    },
  },
  {
    driverIndex: 1,
    mechanicIndex: 1,
    problemType: 'engine',
    description: 'Engine overheating, temperature warning light is on.',
    location: {
      type: 'Point',
      coordinates: [-118.2637, 34.0407],
      address: 'I-110 N near Downtown LA, CA',
    },
    status: 'accepted',
    priority: 'critical',
    vehicleInfo: {
      type: 'Box Truck',
      model: 'Isuzu NPR',
      year: 2019,
      plateNumber: 'CA-BOX-2002',
    },
    acceptedAt: new Date(),
    estimatedArrival: new Date(Date.now() + 45 * 60 * 1000),
  },
  {
    driverIndex: 2,
    mechanicIndex: 2,
    problemType: 'brake',
    description: 'Brakes feel spongy and pull to one side.',
    location: {
      type: 'Point',
      coordinates: [-112.0740, 33.4484],
      address: 'Loop 202 near Phoenix, AZ',
    },
    status: 'completed',
    priority: 'medium',
    vehicleInfo: {
      type: 'Flatbed',
      model: 'Peterbilt 389',
      year: 2020,
      plateNumber: 'AZ-FLT-3003',
    },
    acceptedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

module.exports = { users, drivers, mechanics, emergencyRequests };
