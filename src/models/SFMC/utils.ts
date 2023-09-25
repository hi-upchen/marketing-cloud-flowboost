/**
 * Retrieves the ID of the currently active tab in the current window.
 *
 * @returns A promise that resolves with the active tab's ID (a number) or undefined if no active tab is found.
 */
export function getActiveTab(): Promise<chrome.tabs.Tab> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        reject(undefined);
      }
    });
  });
}

export function resolveStackIdFromURL(sfmcURL: string): string|null {
	if (sfmcURL?.includes("exacttarget") && !sfmcURL.includes("login.html")) {
		// Extract stackid from the URL
		var urlPath = sfmcURL.split("/");
		var stackId = urlPath[2].split(".")[1];
		return stackId
	} else {
		return null
	}
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
