const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: message => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}\n`;

    console.log(logMessage.trim());
    fs.appendFileSync(path.join(logsDir, 'info.log'), logMessage);
  },

  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ERROR: ${message}\n`;

    if (error) {
      logMessage += `Stack: ${error.stack}\n`;
    }

    console.error(logMessage.trim());
    fs.appendFileSync(path.join(logsDir, 'error.log'), logMessage);
  },

  warn: message => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}\n`;

    console.warn(logMessage.trim());
    fs.appendFileSync(path.join(logsDir, 'warn.log'), logMessage);
  },
};

module.exports = logger;
