function logInfo(event, payload = {}) {
  const entry = {
    level: 'info',
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  console.log(JSON.stringify(entry));
}

function logError(event, payload = {}) {
  const entry = {
    level: 'error',
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  console.error(JSON.stringify(entry));
}

module.exports = {
  logInfo,
  logError,
};
