/**
 * mailParser.js
 * 
 * Module pour analyser les emails et détecter :
 * - Liens de désabonnement
 * - Type d'email (newsletter, spam, normal)
 * - Extraction métadonnées (expéditeur, sujet, date, taille)
 * 
 * Utilisable dans toutes les versions CleanInbox (core).
 */

const { JSDOM } = require('jsdom'); // Pour parser HTML côté serveur (Node.js)

// Expressions régulières pour détecter unsubscribe
const UNSUBSCRIBE_PATTERNS = [
  /unsubscribe/i,
  /se désabonner/i,
  /désinscrire/i,
  /opt[- ]?out/i,
  /manage preferences/i,
  /update subscription/i,
  /modifier mes préférences/i,
  /stop receiving/i,
];

// Expressions pour détecter newsletter dans le sujet ou expéditeur
const NEWSLETTER_PATTERNS = [
  /newsletter/i,
  /news/i,
  /digest/i,
  /promo/i,
  /offre/i,
  /promotion/i,
  /update/i,
];

// Expressions pour détecter spam (simplifié)
const SPAM_PATTERNS = [
  /viagra/i,
  /free money/i,
  /win a prize/i,
  /click here/i,
  /urgent/i,
];

/**
 * Extraire tous les liens de désabonnement depuis un contenu HTML
 * @param {string} htmlContent 
 * @returns {string[]} Array de liens unsubscribe
 */
function extractUnsubscribeLinks(htmlContent) {
  if (!htmlContent) return [];

  const dom = new JSDOM(htmlContent);
  const anchors = dom.window.document.querySelectorAll('a');
  const links = [];

  anchors.forEach(a => {
    const href = a.href;
    const text = a.textContent || '';
    const combined = `${href} ${text}`;

    if (UNSUBSCRIBE_PATTERNS.some(pattern => pattern.test(combined))) {
      links.push(href);
    }
  });

  return [...new Set(links)]; // Unique links
}

/**
 * Identifier si un mail est une newsletter selon sujet, expéditeur et contenu
 * @param {Object} mailMetadata 
 * @param {string} mailMetadata.subject 
 * @param {string} mailMetadata.from 
 * @param {string} mailMetadata.htmlBody 
 * @returns {boolean}
 */
function isNewsletter({ subject, from, htmlBody }) {
  const combinedText = `${subject} ${from} ${htmlBody || ''}`.toLowerCase();

  return NEWSLETTER_PATTERNS.some(pattern => pattern.test(combinedText));
}

/**
 * Identifier si un mail est spam selon contenu et sujet (simplifié)
 * @param {Object} mailMetadata 
 * @param {string} mailMetadata.subject 
 * @param {string} mailMetadata.textBody 
 * @returns {boolean}
 */
function isSpam({ subject, textBody }) {
  const combinedText = `${subject} ${textBody || ''}`.toLowerCase();

  return SPAM_PATTERNS.some(pattern => pattern.test(combinedText));
}

/**
 * Extraire les métadonnées principales d'un email
 * @param {Object} rawMail 
 * @returns {Object} { from, to, subject, date, size }
 */
function extractMetadata(rawMail) {
  return {
    from: rawMail.from || '',
    to: rawMail.to || '',
    subject: rawMail.subject || '',
    date: rawMail.date || '',
    size: rawMail.size || 0,
  };
}

module.exports = {
  extractUnsubscribeLinks,
  isNewsletter,
  isSpam,
  extractMetadata,
};
