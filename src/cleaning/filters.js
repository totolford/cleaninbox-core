/**
 * filters.js
 * 
 * Fonctions de filtrage d'emails pour CleanInbox Core.
 * Chaque fonction prend un email en entrée et retourne true si le mail passe le filtre.
 */

/**
 * Filtre pour les mails plus vieux qu'une date donnée.
 * @param {Date} beforeDate - Date limite (exclue).
 * @returns {function(Object): boolean}
 */
function filterOlderThan(beforeDate) {
  return function(email) {
    return email.date < beforeDate;
  };
}

/**
 * Filtre pour les mails provenant d'un expéditeur spécifique (email ou domaine).
 * @param {string} senderEmailOrDomain - Email complet ou domaine (ex: 'example.com').
 * @returns {function(Object): boolean}
 */
function filterFromSender(senderEmailOrDomain) {
  return function(email) {
    const from = email.from.toLowerCase();
    const filterValue = senderEmailOrDomain.toLowerCase();

    // Si on filtre par domaine (ex : example.com)
    if (!filterValue.includes('@')) {
      return from.endsWith(`@${filterValue}`);
    }

    // Sinon par adresse email complète
    return from === filterValue;
  };
}

/**
 * Filtre pour les mails dont le sujet contient un mot clé (case insensitive).
 * @param {string} keyword
 * @returns {function(Object): boolean}
 */
function filterSubjectContains(keyword) {
  return function(email) {
    if (!email.subject) return false;
    return email.subject.toLowerCase().includes(keyword.toLowerCase());
  };
}

/**
 * Filtre pour les mails dont la taille est supérieure à une valeur donnée (en octets).
 * @param {number} minSizeBytes
 * @returns {function(Object): boolean}
 */
function filterSizeGreaterThan(minSizeBytes) {
  return function(email) {
    return email.size > minSizeBytes;
  };
}

/**
 * Filtre pour les mails avec une catégorie spécifique (newsletter, spam, etc).
 * @param {string} category
 * @returns {function(Object): boolean}
 */
function filterCategory(category) {
  return function(email) {
    if (!email.categories || !Array.isArray(email.categories)) return false;
    return email.categories.includes(category.toLowerCase());
  };
}

/**
 * Filtre pour mails non lus uniquement.
 * @returns {function(Object): boolean}
 */
function filterUnread() {
  return function(email) {
    return email.isRead === false;
  };
}

/**
 * Combinaison logique AND de plusieurs filtres.
 * @param {Array<function(Object): boolean>} filters
 * @returns {function(Object): boolean}
 */
function combineFiltersAnd(filters) {
  return function(email) {
    return filters.every(filterFn => filterFn(email));
  };
}

/**
 * Combinaison logique OR de plusieurs filtres.
 * @param {Array<function(Object): boolean>} filters
 * @returns {function(Object): boolean}
 */
function combineFiltersOr(filters) {
  return function(email) {
    return filters.some(filterFn => filterFn(email));
  };
}

module.exports = {
  filterOlderThan,
  filterFromSender,
  filterSubjectContains,
  filterSizeGreaterThan,
  filterCategory,
  filterUnread,
  combineFiltersAnd,
  combineFiltersOr,
};
