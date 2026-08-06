/**
 * Database seeder for the TruckerLink API.
 *
 * Usage:
 *   npm run seed            # wipe the seeded collections and insert fresh data
 *   npm run seed:destroy    # only remove all seeded data
 *
 * The shared account password is read from the SEED_PASSWORD env var
 * (defaults to "Password123"). See `.env.example` for configuration.
 *
 * NOTE: this is destructive — it deletes ALL documents in the User, Driver,
 * Mechanic and EmergencyRequest collections before inserting. Intended for
 * local development and staging, never production.
 */

const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

const User = require('../models/User');
const Driver = require('../models/Driver');
const Mechanic = require('../models/Mechanic');
const EmergencyRequest = require('../models/EmergencyRequest');

const { users, drivers, mechanics, emergencyRequests } = require('./data');

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Password123';

const connect = async () => {
  await mongoose.connect(config.db.uri);
  logger.info(`Seeder connected to MongoDB at ${config.db.uri}`);
};

const destroy = async () => {
  await Promise.all([
    User.deleteMany({}),
    Driver.deleteMany({}),
    Mechanic.deleteMany({}),
    EmergencyRequest.deleteMany({}),
  ]);
  logger.info('Cleared User, Driver, Mechanic and EmergencyRequest collections');
};

const importData = async () => {
  await destroy();

  // Use `.create()` (not insertMany) so the password-hashing pre-save hooks run.
  const createdUsers = await User.create(
    users.map(u => ({ ...u, password: SEED_PASSWORD }))
  );
  logger.info(`Seeded ${createdUsers.length} users`);

  const createdDrivers = await Driver.create(
    drivers.map(d => ({ ...d, password: SEED_PASSWORD }))
  );
  logger.info(`Seeded ${createdDrivers.length} drivers`);

  const createdMechanics = await Mechanic.create(
    mechanics.map(m => ({ ...m, password: SEED_PASSWORD }))
  );
  logger.info(`Seeded ${createdMechanics.length} mechanics`);

  const requestDocs = emergencyRequests.map(req => {
    const { driverIndex, mechanicIndex, ...rest } = req;
    return {
      ...rest,
      driver: createdDrivers[driverIndex]._id,
      mechanic:
        mechanicIndex === null ? null : createdMechanics[mechanicIndex]._id,
    };
  });
  const createdRequests = await EmergencyRequest.create(requestDocs);
  logger.info(`Seeded ${createdRequests.length} emergency requests`);

  logger.info('Seed data imported successfully');
  logger.info(`All seeded accounts share the password: "${SEED_PASSWORD}"`);
  logger.info(`Superuser login: ${users.find(u => u.role === 'superuser').email}`);
};

const run = async () => {
  const destroyOnly = process.argv.includes('--destroy');

  try {
    await connect();

    if (destroyOnly) {
      await destroy();
      logger.info('Seed data destroyed');
    } else {
      await importData();
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

run();
