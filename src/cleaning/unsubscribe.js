const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

/**
 * Trouve tous les liens d'unsubscribe dans un contenu HTML
 * @param {string} htmlContent - contenu HTML de l'email
 * @returns {string[]} - liste d'URLs unsubscribe trouvées
 */
function findUnsubscribeLinks(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  const links = [...document.querySelectorAll('a')];
  
  // Mots clés classiques pour unsubscribe
  const unsubscribeKeywords = ['unsubscribe', 'se désabonner', 'désinscrire', 'opt out', 'unsub', 'cancel subscription'];

  // Recherche les liens dont le texte contient un mot clé unsubscribe
  const unsubscribeLinks = links
    .filter(link => {
      const text = (link.textContent || '').toLowerCase();
      const href = (link.href || '').toLowerCase();
      return unsubscribeKeywords.some(keyword => text.includes(keyword) || href.includes(keyword));
    })
    .map(link => link.href);

  return unsubscribeLinks;
}

/**
 * Tente de déclencher la désinscription via une requête HTTP sur les liens unsubscribe détectés
 * @param {string[]} unsubscribeLinks - liste d'URLs unsubscribe
 * @returns {Promise<Object[]>} - résultats des requêtes [{url, status, error}]
 */
async function unsubscribeFromLinks(unsubscribeLinks) {
  const results = [];

  for (const url of unsubscribeLinks) {
    try {
      // On fait une requête GET simple, certains liens demandent POST ou formulaire, à améliorer selon besoin
      const response = await fetch(url, { method: 'GET', redirect: 'follow' });
      results.push({
        url,
        status: response.status,
        ok: response.ok,
      });
    } catch (error) {
      results.push({
        url,
        status: null,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Fonction principale pour extraire et tenter la désinscription
 * @param {string} emailHtmlContent - contenu HTML de l'email
 * @param {boolean} autoUnsubscribe - si true, lance les requêtes de désabonnement automatiquement
 * @returns {Promise<Object>} - {links: string[], results: Object[]|null}
 */
async function unsubscribeFromEmail(emailHtmlContent, autoUnsubscribe = false) {
  const links = findUnsubscribeLinks(emailHtmlContent);
  if (autoUnsubscribe && links.length > 0) {
    const results = await unsubscribeFromLinks(links);
    return { links, results };
  }
  return { links, results: null };
}

module.exports = {
  findUnsubscribeLinks,
  unsubscribeFromLinks,
  unsubscribeFromEmail,
};
