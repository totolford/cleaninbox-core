// dateUtils.js
// Fonctions utilitaires pour la gestion des dates/heures dans CleanInbox-Core

/**
 * Retourne la date actuelle au format ISO standard.
 * Exemple : "2025-06-09T14:23:30.123Z"
 */
function getCurrentISODate() {
  return new Date().toISOString();
}

/**
 * Convertit une date string ou un timestamp en objet Date.
 * @param {string|number|Date} dateInput - date en string ISO, timestamp ms, ou objet Date
 * @returns {Date} objet Date valide
 */
function parseDate(dateInput) {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === "number") return new Date(dateInput);
  if (typeof dateInput === "string") return new Date(Date.parse(dateInput));
  throw new Error("Input non reconnu en date");
}

/**
 * Calcule la différence en jours entre 2 dates.
 * @param {Date|string|number} date1 - date 1
 * @param {Date|string|number} date2 - date 2
 * @returns {number} nombre entier de jours entre date1 et date2 (valeur absolue)
 */
function diffDays(date1, date2) {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffMs = Math.abs(d2 - d1);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Vérifie si une date est plus ancienne que N jours par rapport à maintenant.
 * @param {Date|string|number} dateToCheck - date à tester
 * @param {number} days - nombre de jours
 * @returns {boolean} true si dateToCheck est antérieure à (maintenant - days)
 */
function isOlderThanDays(dateToCheck, days) {
  const d = parseDate(dateToCheck);
  const now = new Date();
  const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d < threshold;
}

/**
 * Formatte une date au format "YYYY-MM-DD"
 * @param {Date|string|number} dateInput
 * @returns {string} date formatée
 */
function formatDateISOShort(dateInput) {
  const d = parseDate(dateInput);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  getCurrentISODate,
  parseDate,
  diffDays,
  isOlderThanDays,
  formatDateISOShort,
};
