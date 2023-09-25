/**
 * Retrieves a value from Chrome local storage.
 *
 * @param keys - The key(s) to retrieve from local storage. Can be a single string or an array of strings.
 * @returns A promise that resolves with the retrieved value(s) or an object of key-value pairs.
 * @throws An error if the key(s) are not found in local storage.
 */
const getFromLocalStorage = async <T>(keys: string[]): Promise<Record<string, T>> => {
  return new Promise<Record<string, T>>((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(`Error: ${chrome.runtime.lastError}`);
      } else {
        resolve(result as Record<string, T>);
      }
    });
  }).catch((error) => {
    console.error(error);
    throw error;
  });
};

/**
 * Checks the size of a value stored in Chrome local storage.
 *
 * @param key - The key to check the size for.
 * @returns A promise that resolves with the size of the value in bytes.
 * @throws An error if the size cannot be determined.
 */
const checkLocalStorageSize = async (key: string): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    chrome.storage.local.getBytesInUse([key], (bytesInUse) => {
      if (typeof bytesInUse === 'undefined') {
        reject(`Error finding: ${key}`);
      } else {
        resolve(bytesInUse);
      }
    });
  });
};

/**
 * Set default values in chrome.storage.local.
 */
async function setDefaultLocalStorage(defaultValues: Record<string, any>) {
  for (const key in defaultValues) {
    if (defaultValues.hasOwnProperty(key)) {
      const result = await new Promise<any>((resolve) => {
        chrome.storage.local.get([key], (data) => {
          resolve(data);
        });
      });

      if (typeof result[key] === "undefined") {
        const data = { [key]: defaultValues[key] };
        await new Promise<void>((resolve) => {
          chrome.storage.local.set(data, () => {
            console.log(`Default value for ${key} set in local storage.`);
            resolve();
          });
        });
      }
    }
  }
}

/**
 * Sets a value in the Chrome local storage.
 *
 * @param key - The key to store the value under.
 * @param value - The value to store.
 */
function setInLocalStorage(key: string, value: any): void {
  chrome.storage.local.set({ [key]: value });
}

export {getFromLocalStorage, checkLocalStorageSize, setInLocalStorage, setDefaultLocalStorage}