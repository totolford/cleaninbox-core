// Logger simple console

class Logger {
  log(message) {
    console.log('[LOG]', message);
  }

  error(message) {
    console.error('[ERROR]', message);
  }
}

module.exports = new Logger();
