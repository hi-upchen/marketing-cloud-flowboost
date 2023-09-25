declare global {
  interface Console {
    logs: any[];
    warnings: any[];
    errors: any[];
  }
}

const histories: Array<LogRowInterafce> = []

function getLogs(): any[] {
  return histories
}

interface LogRowInterafce {
  level:'log'|'info'|'warn'|'error',
  timestamp: Number,
  payload: any
}

// Intercept console logs and errors
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = function (...args: any[]) {
  originalLog.apply(console, args);
  histories.push({
    level: 'log',
    timestamp: Date.now(),
    payload: args
  });
  sendLogsToPopup();
};

console.info = function (...args: any[]) {
  originalLog.apply(console, args);
  histories.push({
    level: 'info',
    timestamp: Date.now(),
    payload: args
  });
  sendLogsToPopup();
};

console.warn = function (...args: any[]) {
  originalWarn.apply(console, args);
  histories.push({
    level: 'warn',
    timestamp: Date.now(),
    payload: args
  });
  sendLogsToPopup();
};

console.error = function (...args: any[]) {
  originalError.apply(console, args);
  histories.push({
    level: 'error',
    timestamp: Date.now(),
    payload: args
  });
  sendLogsToPopup();
};

function sendLogsToPopup() {
  const logs = getLogs();
  chrome.runtime.sendMessage({ action: "updateLogs", logs });
}

export default console
export {LogRowInterafce}