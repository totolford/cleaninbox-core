/**
 * userManager.js
 * Gestion des utilisateurs, profils et droits premium
 * Partie core commune à toutes les versions CleanInbox
 */

const crypto = require('crypto');

// Simplicité : stockage en mémoire (à remplacer par vraie BDD dans production)
const usersDB = new Map();

/**
 * Structure utilisateur type :
 * {
 *   id: string,
 *   email: string,
 *   premiumLevel: 0 | 1 | 2,   // 0 = free, 1 = premium 0.99€, 2 = premium 4.99€
 *   subscriptionValid: boolean,
 *   subscriptionExpiry: Date|null,
 *   preferences: object,
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

class UserManager {
  /**
   * Crée un nouvel utilisateur ou récupère un utilisateur existant par email
   * @param {string} email
   * @returns {object} utilisateur
   */
  static getOrCreateUser(email) {
    // Cherche user par email
    for (const user of usersDB.values()) {
      if (user.email === email) return user;
    }
    // Sinon créer user
    const id = crypto.randomUUID();
    const now = new Date();
    const newUser = {
      id,
      email,
      premiumLevel: 0,
      subscriptionValid: false,
      subscriptionExpiry: null,
      preferences: {},
      createdAt: now,
      updatedAt: now,
    };
    usersDB.set(id, newUser);
    return newUser;
  }

  /**
   * Met à jour les infos d'abonnement d'un utilisateur
   * @param {string} userId
   * @param {object} subscriptionData (ex: { level: 1, valid: true, expiry: Date })
   * @returns {object|null} utilisateur mis à jour ou null si non trouvé
   */
  static updateSubscription(userId, subscriptionData) {
    const user = usersDB.get(userId);
    if (!user) return null;

    user.premiumLevel = subscriptionData.level ?? user.premiumLevel;
    user.subscriptionValid = subscriptionData.valid ?? user.subscriptionValid;
    user.subscriptionExpiry = subscriptionData.expiry ?? user.subscriptionExpiry;
    user.updatedAt = new Date();

    usersDB.set(userId, user);
    return user;
  }

  /**
   * Vérifie si un utilisateur a accès à une fonctionnalité premium donnée
   * @param {string} userId
   * @param {number} requiredLevel Niveau premium requis (0 = free, 1, 2)
   * @returns {boolean}
   */
  static hasAccess(userId, requiredLevel) {
    const user = usersDB.get(userId);
    if (!user) return false;

    // Valide si abonnement actif
    if (!user.subscriptionValid) return false;

    // Check niveau premium
    return user.premiumLevel >= requiredLevel;
  }

  /**
   * Met à jour les préférences utilisateur
   * @param {string} userId
   * @param {object} newPrefs
   * @returns {object|null} utilisateur mis à jour ou null si non trouvé
   */
  static updatePreferences(userId, newPrefs) {
    const user = usersDB.get(userId);
    if (!user) return null;

    user.preferences = {
      ...user.preferences,
      ...newPrefs,
    };
    user.updatedAt = new Date();

    usersDB.set(userId, user);
    return user;
  }

  /**
   * Récupère les préférences utilisateur
   * @param {string} userId
   * @returns {object|null} préférences ou null si user non trouvé
   */
  static getPreferences(userId) {
    const user = usersDB.get(userId);
    return user ? user.preferences : null;
  }
}

module.exports = UserManager;
