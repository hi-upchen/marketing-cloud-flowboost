import type { MCUserData } from './MCAPI.d.ts'
import { getActiveTab, resolveStackIdFromURL, sleep } from './utils'; // Import the function

export default class MCBase {
	public stackId: string | null = null;
	public businessUnitId: number | null = null;
	public accessToken: string | null = null;
	public legacyToken: string | null = null;
	public legacyTokenExpires: number | null = null;

	constructor() { }

	// print all the variables in the object (for debug use)
	public printInstanceVariables() {
		for (const key in this) {
			if (this.hasOwnProperty(key)) {
				console.log(`${key}: ${this[key]}`);
			}
		}
	}

	// url: window.location.href
	public async setStackIdFromUrl(currentURL: string|null): Promise<string | null> {
		if ( !currentURL) {
			return null
		}
		this.stackId = resolveStackIdFromURL(currentURL)
		return this.stackId
	}


	// fetch the auth tokens from the marketing cloud
	public async doAuth(): Promise<this> {
		if (!this.stackId) {
			throw new Error(`stackId is empty, you may need to use setStackIdFromUrl() first or set stackId directly.`)
		}

		const stackId = this.stackId

		// Section 1: Get Legacy Token
		let legacyTokenData: { accessToken: string, expiresIn: number, legacyToken: string } =
			await this.getFetch("https://mc." + ("s1." == stackId ? "" : stackId + ".") + "exacttarget.com/cloud/update-token.json");
		// console.log('legacyTokenData', legacyTokenData);
		this.legacyToken = legacyTokenData.accessToken
		this.legacyTokenExpires = Date.parse(Date()) + 1e3 * legacyTokenData.expiresIn

		// Section 2: Get REST Token
		let restTokenData: { accessToken: string, legacyToken: string, token: string } =
			await this.getFetch("https://mc." + stackId + ".marketingcloudapps.com/AutomationStudioFuel3/update-token.json");
		// console.log('restTokenData', restTokenData)
		this.accessToken = restTokenData.accessToken

		// Section 3: Get User Details
		var userData: MCUserData =
			await this.getFetch("https://mc." + stackId + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/legacy/v1/beta/organization/user/@me");
		this.businessUnitId = userData.businessUnitId

		// var businessRulesData: Object = await getFetch("https://mc." + stackId + ".marketingcloudapps.com/AutomationStudioFuel3/fuelapi/platform-internal/v1/businessrules/@me?$pagesize=1000&$page=1");

		// console.log('userData', userData);
		// console.log('businessRulesData', businessRulesData);

		return this
	}

	/**
	 * Fetches data from a URL using the fetch API.
	 * @param {string} url - The URL to fetch data from.
	 * @returns {Promise} - A promise that resolves to the fetched data.
	 */
	public async getFetch(url: string): Promise<any> {
		return new Promise(async function (resolve, reject) {
			try {
				let response = await fetch(url, {
					credentials: 'include' // Include cookies
				});

				if (!(response.status >= 200 && response.status < 300)) {
					// asyncAddAlert("Fetch", Date.parse(Date()), response.status, "Fetch Failed to: ", url);
					reject(new Error("Error: Fetch to " + url + " Failed"));
				}

				let responseBody = await response.text();
				resolve(JSON.parse(responseBody));
			} catch (error) {
				reject(error);
			}
		});
	}

	public isAuthed(): boolean {
		return this.accessToken !== null
	}

	public async getCSFRTokenFromCookie(): Promise<string | null> {
		return new Promise((resolve, reject) => {
			chrome.cookies.getAll(
				{ domain: `content-builder.${this.stackId}.marketingcloudapps.com` },
				(cookies) => {
					if (chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
						return;
					}

					const cookiesForDomain: Record<string, string> = {};

					for (const cookie of cookies) {
						cookiesForDomain[cookie.name] = cookie.value;
						// console.log('cookie', cookie.name, cookie.value);
					}

					if (cookiesForDomain['_csrf']) {
						resolve(cookiesForDomain['_csrf']);
					} else {
						resolve(null)
					}
				}
			);
		});
	}

	/**
	 * Load the pages which contains the _csfr token to be used for other pages.
	 * @returns string csrf token
	 */
	public async ensureCSRFToken(): Promise<string | null> {
		console.info("Fetching CSFR token ...")

    let currentActiveTab = await getActiveTab(); // restore this tab once fzinished

		// let tabId = await this.openTab(`https://mc.${this.stackId}.exacttarget.com/cloud/#app/Email`)
		let tabId = await this.openTab(`https://mc.${this.stackId}.exacttarget.com/cloud/#app/Email/C12/Default.aspx?entityType=none&entityID=0&ks=ks%23Content`)
		// let tab = await this.findTabById(tabId)

		if (!tabId) {
			throw new Error("Cannot resolve the tabId which just opened.")
		}

		let tabHTML = await this.fetchTabHTML(tabId)
		await sleep(5*1000)
		await this.closeTabById(tabId)

		let csfrToken = await this.getCSFRTokenFromCookie()
		console.log('resolved csfrToken', csfrToken)

		// restore the original tab
		await chrome.tabs.update(currentActiveTab.id as number, { active: true })

		return csfrToken
	}

	/**
	 * Find a tab by its ID.
	 * @param tabId The ID of the tab to find.
	 * @returns A promise that resolves with the found tab or null if not found.
	 */
	public async findTabById(tabId: number): Promise<chrome.tabs.Tab | null> {
		return new Promise<chrome.tabs.Tab | null>((resolve) => {
			chrome.tabs.get(tabId, (tab) => {
				if (chrome.runtime.lastError) {
					resolve(null); // Error occurred or tab not found
				} else {
					resolve(tab);
				}
			});
		});
	}

	/**
	 * Open a new tab with the given URL and resolve the tab ID when it's fully loaded.
	 * @param url The URL to open in the new tab.
	 * @returns A promise that resolves with the ID of the opened tab.
	 */
	public async openTab(url: string): Promise<number> {
		return new Promise<number>((resolve) => {
			chrome.tabs.create({ url: url }, (newTab) => {
				const listener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
					if (tabId === newTab.id && changeInfo.status === 'complete') {
						chrome.tabs.onUpdated.removeListener(listener);
						resolve(newTab.id);
					}
				};

				chrome.tabs.onUpdated.addListener(listener);
			});
		});
	}

  /**
   * Close a tab by its ID asynchronously.
   * @param tabId The ID of the tab to close.
   * @returns A promise that resolves when the tab is closed.
   */
  public async closeTabById(tabId: number): Promise<void> {
    return new Promise<void>((resolve) => {
      chrome.tabs.remove(tabId, () => {
        resolve();
      });
    });
  }

	/**
	 * Fetch the HTML content of a tab, including the HTML of all nested iframes.
	 * @param tab The tab object for which to fetch the HTML.
	 * @returns A promise that resolves with the fetched HTML content.
	 */
	public async fetchTabHTML(tabId: number): Promise<string> {
		return new Promise<string>((resolve) => {
			// Inject a content script to the tab
			chrome.scripting.executeScript(
				{
					target: { tabId: tabId },
					func: () => {
						// Recursive function to fetch HTML content of all iframes
						function fetchIframeHTML(iframeElement: Document|HTMLIFrameElement): string {
							if (!iframeElement) {
								return '';
							}

							let iframeDocument
							if (iframeElement instanceof Document) {
								iframeDocument = iframeElement
							} else if (iframeElement instanceof HTMLIFrameElement) {
								iframeDocument = iframeElement.contentDocument;
							}

							if (!iframeDocument) {
								return '';
							}

							const iframeHTML = iframeDocument.documentElement.outerHTML;

							// Fetch HTML content of nested iframes
							const nestedIframes = iframeDocument.querySelectorAll('iframe');
							let nestedHTML = '';
							nestedIframes.forEach((nestedIframe) => {
								nestedHTML += fetchIframeHTML(nestedIframe as HTMLIFrameElement);
							});

							return iframeHTML + nestedHTML;
						}

						// Fetch HTML content of main document and nested iframes
						return fetchIframeHTML(document);
					},
				},
				(result) => {
					if (chrome.runtime.lastError) {
						resolve(''); // Handle error here
					} else {
						resolve(result[0].result as string);
					}
				}
			);
		});
	}

}

export { MCBase }