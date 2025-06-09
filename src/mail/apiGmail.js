/**
 * Module apiGmail.js
 * Gestion des interactions avec l'API Gmail
 * - Authentification OAuth2
 * - Lecture des emails
 * - Suppression des emails
 */

const { google } = require('googleapis');

class GmailAPI {
  /**
   * Constructor
   * @param {object} tokens - OAuth tokens { access_token, refresh_token, scope, token_type, expiry_date }
   */
  constructor(tokens) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
    this.oauth2Client.setCredentials(tokens);
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Refresh tokens if needed
   */
  async refreshTokenIfNeeded() {
    if (!this.oauth2Client.isTokenExpiring()) return;
    try {
      const newTokens = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(newTokens.credentials);
      // Ici tu peux sauvegarder les nouveaux tokens côté backend
      return newTokens.credentials;
    } catch (error) {
      throw new Error('Erreur lors du rafraîchissement du token: ' + error.message);
    }
  }

  /**
   * Liste les IDs des messages dans la boîte
   * @param {string} userId - ID utilisateur (ex: 'me')
   * @param {object} options - options filtres (ex : { maxResults: 50, q: 'is:unread' })
   * @returns {Promise<Array<string>>} - tableau d'IDs
   */
  async listMessageIds(userId = 'me', options = {}) {
    try {
      const res = await this.gmail.users.messages.list({
        userId,
        maxResults: options.maxResults || 100,
        q: options.q || '',
      });
      return res.data.messages ? res.data.messages.map(msg => msg.id) : [];
    } catch (error) {
      throw new Error('Erreur listMessageIds: ' + error.message);
    }
  }

  /**
   * Récupère le détail complet d'un message
   * @param {string} messageId
   * @param {string} userId
   * @returns {Promise<object>} - objet message complet
   */
  async getMessage(messageId, userId = 'me') {
    try {
      const res = await this.gmail.users.messages.get({
        userId,
        id: messageId,
        format: 'full', // options: minimal, full, raw, metadata
      });
      return res.data;
    } catch (error) {
      throw new Error('Erreur getMessage: ' + error.message);
    }
  }

  /**
   * Supprime un message
   * @param {string} messageId
   * @param {string} userId
   */
  async deleteMessage(messageId, userId = 'me') {
    try {
      await this.gmail.users.messages.delete({
        userId,
        id: messageId,
      });
      return true;
    } catch (error) {
      throw new Error('Erreur deleteMessage: ' + error.message);
    }
  }

  /**
   * Marque un message comme lu
   * @param {string} messageId
   * @param {string} userId
   */
  async markAsRead(messageId, userId = 'me') {
    try {
      await this.gmail.users.messages.modify({
        userId,
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
      return true;
    } catch (error) {
      throw new Error('Erreur markAsRead: ' + error.message);
    }
  }
}

module.exports = GmailAPI;
