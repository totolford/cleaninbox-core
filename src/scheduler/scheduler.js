const EventEmitter = require('events');

class Scheduler extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map(); // stocke les jobs par id
  }

  /**
   * Ajoute une tâche planifiée
   * @param {string} jobId - Identifiant unique du job
   * @param {function} taskFn - Fonction asynchrone à exécuter
   * @param {number} intervalMs - Intervalle d’exécution en millisecondes
   */
  addJob(jobId, taskFn, intervalMs) {
    if (this.jobs.has(jobId)) {
      throw new Error(`Job avec l'id ${jobId} existe déjà.`);
    }

    // Exécuter la tâche immédiatement puis à intervalle régulier
    const executeTask = async () => {
      try {
        await taskFn();
        this.emit('jobSuccess', jobId);
      } catch (err) {
        this.emit('jobError', jobId, err);
      }
    };

    executeTask();

    const timer = setInterval(executeTask, intervalMs);
    this.jobs.set(jobId, timer);
  }

  /**
   * Supprime une tâche planifiée
   * @param {string} jobId
   */
  removeJob(jobId) {
    if (!this.jobs.has(jobId)) {
      throw new Error(`Job avec l'id ${jobId} n'existe pas.`);
    }
    clearInterval(this.jobs.get(jobId));
    this.jobs.delete(jobId);
    this.emit('jobRemoved', jobId);
  }

  /**
   * Arrête toutes les tâches planifiées
   */
  stopAll() {
    for (const [jobId, timer] of this.jobs.entries()) {
      clearInterval(timer);
      this.emit('jobRemoved', jobId);
    }
    this.jobs.clear();
  }

  /**
   * Liste les tâches planifiées
   * @returns {string[]} tableau d’IDs
   */
  listJobs() {
    return Array.from(this.jobs.keys());
  }
}

module.exports = Scheduler;
