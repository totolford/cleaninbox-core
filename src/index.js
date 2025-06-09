// index.js - point d'entrée de cleaninbox-core

// Import des modules principaux
const auth = require('./src/auth/oauth');
const gmailApi = require('./src/mail/apiGmail');
const outlookApi = require('./src/mail/apiOutlook');
const imapClient = require('./src/mail/imapClient');

const mailParser = require('./src/mail/mailParser');

const cleaner = require('./src/cleaning/cleaner');
const unsubscribe = require('./src/cleaning/unsubscribe');
const filters = require('./src/cleaning/filters');

const scheduler = require('./src/scheduler/scheduler');

const userManager = require('./src/user/userManager');

const logger = require('./src/logging/logger');

const utils = require('./src/utils');

// Export centralisé de toutes les fonctionnalités
module.exports = {
  auth,
  mailApis: {
    gmail: gmailApi,
    outlook: outlookApi,
    imap: imapClient,
  },
  mailParser,
  cleaning: {
    cleaner,
    unsubscribe,
    filters,
  },
  scheduler,
  userManager,
  logger,
  utils,
};
