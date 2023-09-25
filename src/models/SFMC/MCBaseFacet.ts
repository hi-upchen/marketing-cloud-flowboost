import { MCBase } from "./MCBase";

export abstract class MCBaseFacet {
	protected mcBase: MCBase;

	constructor(mcBase: MCBase) {
		this.mcBase = mcBase;
	}

	isAuthed(): boolean {
		return this.mcBase.isAuthed();
	}

	ensureAuth() {
		this.mcBase.auth();
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

	/**
* Sends a POST request to a URL using the fetch API.
* @param {string} url - The URL to send the POST request to.
* @param {any} payload - The payload to send in the POST request body.
* @returns {Promise<any>} - A promise that resolves to the response data.
*/
	public async postFetch(url: string, payload: any): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {

				let headers: Record<string, string> = {
					'Content-Type': 'application/json',
				}

				let csrfToken = await this.mcBase.getCSFRTokenFromCookie()
				if (csrfToken) {
					headers['X-Csrf-Token'] = csrfToken
				} else {
					console.warn("Cannot determine the _csrf token")
				}

				const response = await fetch(url, {
					method: 'POST',
					credentials: 'include', // Include cookies
					headers,
					body: JSON.stringify(payload)
				});

				if (!(response.status >= 200 && response.status < 300)) {
					// asyncAddAlert("Fetch", Date.parse(Date()), response.status, "Fetch Failed to: ", url);
					reject(new Error(`Error: Fetch POST to ${url} Failed`));
				}

				const responseBody = await response.text();
				resolve(JSON.parse(responseBody));
			} catch (error) {
				reject(error);
			}
		});
	}

}