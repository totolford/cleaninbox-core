// src/mail/apiOutlook.js

const fetch = require('node-fetch');

class OutlookAPI {
  /**
   * Crée une instance OutlookAPI
   * @param {string} accessToken - Token OAuth2 avec scope Mail.ReadWrite
   */
  constructor(accessToken) {
    if (!accessToken) throw new Error('Access token is required');
    this.accessToken = accessToken;
    this.baseUrl = 'https://graph.microsoft.com/v1.0/me';
  }

  /**
   * Récupère une liste d'emails (messages) dans la boîte de réception.
   * @param {number} top - Nombre d'emails à récupérer (max 1000)
   * @returns {Promise<Array>} Liste des messages
   */
  async getEmails(top = 50) {
    const url = `${this.baseUrl}/mailFolders/inbox/messages?$top=${top}&$select=id,subject,receivedDateTime,from,isRead,hasAttachments`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Erreur récupération emails Outlook: ${res.status} ${error}`);
    }

    const data = await res.json();
    return data.value || [];
  }

  /**
   * Récupère le contenu complet d'un email par son ID.
   * @param {string} messageId
   * @returns {Promise<Object>} Message complet avec body, pièces jointes...
   */
  async getEmailById(messageId) {
    const url = `${this.baseUrl}/messages/${messageId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Erreur récupération email ${messageId}: ${res.status} ${error}`);
    }

    const message = await res.json();
    return message;
  }

  /**
   * Supprime un email par son ID (déplace vers la corbeille).
   * @param {string} messageId
   * @returns {Promise<void>}
   */
  async deleteEmail(messageId) {
    const url = `${this.baseUrl}/messages/${messageId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Erreur suppression email ${messageId}: ${res.status} ${error}`);
    }
  }

  /**
   * Marque un email comme lu/non lu.
   * @param {string} messageId
   * @param {boolean} isRead
   * @returns {Promise<void>}
   */
  async markAsRead(messageId, isRead = true) {
    const url = `${this.baseUrl}/messages/${messageId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRead }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Erreur mise à jour lecture email ${messageId}: ${res.status} ${error}`);
    }
  }
}

module.exports = OutlookAPI;
