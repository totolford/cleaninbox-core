// src/mail/imapClient.js

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const EventEmitter = require('events');

class ImapClient extends EventEmitter {
  /**
   * Crée un client IMAP.
   * @param {Object} config - Configuration IMAP
   * @param {string} config.user - Email utilisateur
   * @param {string} config.password - Mot de passe ou token OAuth
   * @param {string} config.host - Serveur IMAP (ex: imap.gmail.com)
   * @param {number} config.port - Port IMAP (ex: 993)
   * @param {boolean} config.tls - TLS activé ou non
   */
  constructor(config) {
    super();
    this.imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false }, // pour éviter erreur certificat
    });
  }

  /**
   * Connexion au serveur IMAP
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        resolve();
      });

      this.imap.once('error', (err) => {
        reject(err);
      });

      this.imap.connect();
    });
  }

  /**
   * Ouvre une boîte aux lettres (mailbox)
   * @param {string} mailboxName
   * @returns {Promise<Object>} info boîte mail
   */
  openMailbox(mailboxName = 'INBOX') {
    return new Promise((resolve, reject) => {
      this.imap.openBox(mailboxName, true, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  /**
   * Recherche d'emails selon un critère IMAP
   * @param {Array} criteria - ex: ['ALL'], ['UNSEEN'], ['SINCE', '1-Jan-2025']
   * @returns {Promise<Array>} IDs des emails correspondants
   */
  search(criteria = ['ALL']) {
    return new Promise((resolve, reject) => {
      this.imap.search(criteria, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  /**
   * Récupère et parse les emails par leurs IDs
   * @param {Array} uids - Liste des IDs d'emails
   * @returns {Promise<Array>} Liste des emails parsés
   */
  fetchEmails(uids) {
    return new Promise((resolve, reject) => {
      if (!uids || uids.length === 0) return resolve([]);

      const fetch = this.imap.fetch(uids, { bodies: '' });
      const emails = [];

      fetch.on('message', (msg) => {
        let raw = '';

        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            raw += chunk.toString('utf8');
          });
        });

        msg.once('end', async () => {
          try {
            const parsed = await simpleParser(raw);
            emails.push({
              uid: msg.seqno,
              subject: parsed.subject,
              from: parsed.from.text,
              to: parsed.to.text,
              date: parsed.date,
              text: parsed.text,
              html: parsed.html,
              attachments: parsed.attachments || [],
            });
          } catch (err) {
            // ignore parse errors
          }
        });
      });

      fetch.once('error', (err) => reject(err));
      fetch.once('end', () => resolve(emails));
    });
  }

  /**
   * Ferme la connexion IMAP
   */
  close() {
    this.imap.end();
  }
}

module.exports = ImapClient;
