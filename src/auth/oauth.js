// oauth.js
// Gestion OAuth 2.0 pour Google Gmail API

const { google } = require('googleapis');
const EventEmitter = require('events');

class OAuthManager extends EventEmitter {
  /**
   * @param {object} config
   * @param {string} config.clientId - Client ID Google API
   * @param {string} config.clientSecret - Client Secret Google API
   * @param {string} config.redirectUri - URI de redirection OAuth (ex: http://localhost:3000/oauth2callback)
   * @param {string[]} config.scopes - Scopes OAuth demandés
   */
  constructor(config) {
    super();
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
    this.scopes = config.scopes;
    this.tokens = null; // Stockage local, à remplacer par stockage DB
  }

  // Génère URL d'auth pour que l'utilisateur autorise l'app
  generateAuthUrl() {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Pour obtenir refresh_token
      scope: this.scopes,
      prompt: 'consent', // Forcer consentement à chaque fois pour refresh_token
    });
    return url;
  }

  // Echange le code reçu après auth pour récupérer tokens
  async getTokensFromCode(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    this.tokens = tokens;
    this.emit('tokensUpdated', tokens);
    return tokens;
  }

  // Récupère le client OAuth configuré avec tokens (valide)
  getOAuthClient() {
    this.oauth2Client.setCredentials(this.tokens);
    return this.oauth2Client;
  }

  // Remplace tokens et émet événement (utile pour sauvegarde)
  setTokens(tokens) {
    this.tokens = tokens;
    this.oauth2Client.setCredentials(tokens);
    this.emit('tokensUpdated', tokens);
  }

  // Rafraîchit access_token si expiré, met à jour tokens
  async refreshAccessTokenIfNeeded() {
    if (!this.tokens || !this.tokens.refresh_token) {
      throw new Error('No refresh token available');
    }
    try {
      const newTokens = await this.oauth2Client.refreshAccessToken();
      this.setTokens(newTokens.credentials);
      return newTokens.credentials;
    } catch (error) {
      console.error('Erreur refresh token:', error);
      throw error;
    }
  }
}

module.exports = OAuthManager;

/*  
Exemple d'utilisation :

const oauth = new OAuthManager({
  clientId: 'TON_CLIENT_ID',
  clientSecret: 'TON_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/oauth2callback',
  scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
});

const url = oauth.generateAuthUrl();
console.log("Visite cette URL pour autoriser:", url);

// Ensuite, après le redirect, récupère le code et échange-le :
// const tokens = await oauth.getTokensFromCode(code);
// oauth.setTokens(tokens);

// Utilise ensuite oauth.getOAuthClient() pour faire des appels API Gmail.
*/
