// cleaner.js
// Module de nettoyage des emails : suppression, archivage, désabonnement

/**
 * Nettoie une liste d'emails selon les règles définies.
 * @param {Array} emails - Liste d'emails (objets) à analyser.
 * @param {Object} options - Options de nettoyage.
 * @param {boolean} options.deleteNewsletters - Supprimer les newsletters.
 * @param {boolean} options.deleteSpam - Supprimer les spams.
 * @param {number} options.maxAgeDays - Supprimer les emails plus vieux que ce nombre de jours.
 * @param {Array<string>} options.exceptSenders - Liste d'expéditeurs à exclure de la suppression.
 * @returns {Array} Résultat avec actions effectuées.
 */
async function cleanEmails(emails, options) {
  const results = [];

  const now = Date.now();
  const maxAgeMillis = options.maxAgeDays ? options.maxAgeDays * 24 * 60 * 60 * 1000 : null;

  for (const email of emails) {
    try {
      // Exclure expéditeurs protégés
      if (options.exceptSenders && options.exceptSenders.includes(email.sender.toLowerCase())) {
        results.push({ emailId: email.id, action: 'skipped - sender protected' });
        continue;
      }

      // Calcul âge email
      const emailDate = new Date(email.date).getTime();
      const ageMillis = now - emailDate;

      // Vérifier suppression par âge
      if (maxAgeMillis && ageMillis > maxAgeMillis) {
        await deleteEmail(email);
        results.push({ emailId: email.id, action: 'deleted - too old' });
        continue;
      }

      // Supprimer newsletters
      if (options.deleteNewsletters && isNewsletter(email)) {
        await deleteEmail(email);
        results.push({ emailId: email.id, action: 'deleted - newsletter' });
        continue;
      }

      // Supprimer spams
      if (options.deleteSpam && email.isSpam) {
        await deleteEmail(email);
        results.push({ emailId: email.id, action: 'deleted - spam' });
        continue;
      }

      // Sinon, aucune action
      results.push({ emailId: email.id, action: 'kept' });
    } catch (error) {
      results.push({ emailId: email.id, action: 'error', error: error.message });
    }
  }

  return results;
}

/**
 * Identifie si un email est une newsletter (simplifié).
 * @param {Object} email - Email à analyser.
 * @returns {boolean}
 */
function isNewsletter(email) {
  const newsletterKeywords = [
    'newsletter',
    'unsubscribe',
    'promo',
    'sale',
    'offers',
    'newsletter@',
  ];

  // Recherche simple dans le sujet et l'expéditeur
  const subject = (email.subject || '').toLowerCase();
  const sender = (email.sender || '').toLowerCase();

  return newsletterKeywords.some(keyword => subject.includes(keyword) || sender.includes(keyword));
}

/**
 * Supprime un email via l'API mail (fonction simulée).
 * @param {Object} email - Email à supprimer.
 */
async function deleteEmail(email) {
  // Ici on appellerait l'API Gmail/Outlook pour supprimer le mail
  // Par exemple: await gmailApi.delete(email.id);

  // Simulation avec délai
  return new Promise((resolve) => setTimeout(resolve, 100));
}

module.exports = {
  cleanEmails,
  isNewsletter,
  deleteEmail,
};
