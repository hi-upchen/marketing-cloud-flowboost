import console from 'src/background-logger'
import type { MessageSendToServiceWorker } from './types/background'
import {MCBase} from 'src/models/SFMC/MCBase'
import MCJourneyBuilder from 'src/models/SFMC/MCJourneyBuilder'
import { getActiveTab, resolveStackIdFromURL } from 'src/models/SFMC/utils';
import { getFromLocalStorage, setInLocalStorage, setDefaultLocalStorage } from 'src/storage';

setDefaultLocalStorage({
  emailRecipients: [],
  emailSubjectPrefix: '[Test]'
})

let mcBase: MCBase = new MCBase();
let mcJourneyBuilder: MCJourneyBuilder;

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Function to handle messages from the content script
const handleMessageSendToServiceWorker = (
  message: MessageSendToServiceWorker,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  console.log('handleMessageSendToServiceWorker', message)

  if (message.type === 'GET_ACTIVE_TAB') {
    getActiveTab()
      .then(activeTab => {
        sendResponse(activeTab)
      })
  } else if (message.type === 'RESOLVE_STACKID_FROM_URL') {
    mcBase.setStackIdFromUrl(message.data.url)
      .then(() => {
        sendResponse(mcBase.stackId)
      })
  } else if (message.type === 'GET_AUTH') {
    mcBase.doAuth()
      .then(() => {
        mcBase.printInstanceVariables()
        sendResponse(mcBase.accessToken)
      })
  } else if (message.type === 'LOAD_JOURNEY_FROM_URL') {
    if ( !mcBase.isAuthed()) {
      throw new Error("the MCBase is not auth yet. Run doAuth first.")
    }
    if ( !message.data.url) {
      throw new Error("Must provide the journey builder URL to load")
    }

    mcJourneyBuilder = new MCJourneyBuilder(mcBase)
    mcJourneyBuilder.loadFromJourneyBuilderUrl(message.data.url)
      .then(() => {
        console.log('Loaded Journey Builder')
      })
      .then(() => {
        //
        return mcJourneyBuilder.resolveEntryDataExtension()
      })
      .then(() => {
        // let emailActs = mcJourneyBuilder.getEmailActivties()
        // console.log('emailActs', emailActs)
        return mcJourneyBuilder.sendAllEmailPreview({
          recipients: ['uchen@greenpeace.org']
        })
      })
  } else if (message.type === '_LIST_COOKIES') {
    chrome.cookies.getAll(
      { domain: `content-builder.${mcBase.stackId}.marketingcloudapps.com` },
      (cookies) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        console.log('Listing Cookies', cookies.length)
        for (const cookie of cookies) {
          console.log('cookie', cookie.name, cookie.value);
        }

        sendResponse()
      }
    );
  } else if (message.type === '_ENSURE_CSRF') {
    getActiveTab()
      .then((tab) => mcBase.setStackIdFromUrl(tab.url as string))
      .then(() => mcBase.doAuth())
      .then(() => mcBase.printInstanceVariables())
      .then(() => mcBase.ensureCSRFToken())
      .then(() => sendResponse())
      .catch((error) => {
        console.error(error.toString());
        throw error;
      });

  } else if (message.type === '_GENERATE_AN_ERROR') {
    console.error('Error:!! Generated Error.')
  } else if (message.type === 'RESOLVE_JOURNEY_BY_JOURNEY_URL') {
    let activeTab: chrome.tabs.Tab;
    mcJourneyBuilder = new MCJourneyBuilder(mcBase)

    getActiveTab()
      .then((tab) => {
        activeTab = tab
        return mcBase.setStackIdFromUrl(tab.url as string)
      })
      .then(() => mcBase.doAuth())
      .then(() => mcBase.setStackIdFromUrl(activeTab.url as string))
      .then(() => mcJourneyBuilder.loadFromJourneyBuilderUrl(activeTab.url as string))
      .then(() => {
        sendResponse(mcJourneyBuilder.journeyData)
      })

  } else if (message.type === 'SEND_EMAILS_BY_JOURNEY_URL') {
    let activeTab: chrome.tabs.Tab;

    let mcBase: MCBase = new MCBase();
    let mcJourneyBuilder: MCJourneyBuilder = new MCJourneyBuilder(mcBase)

    getActiveTab()
      .then((tab) => {
        activeTab = tab

        const pattern = /^https:\/\/mc\..*\.exacttarget\.com\/.*Journey.*$/;
        if ( !pattern.test(tab.url || "")) {
          console.warn('Feature Exclusive to Journey Page')
          throw new Error(`To use the "Send Emails" feature, please navigate to a Salesforce Marketing Cloud Journey page`)
        }

        return mcBase.setStackIdFromUrl(tab.url as string)
      })
      .then(() => mcBase.doAuth())
      // .then(() => mcBase.printInstanceVariables())
      .then(() => mcBase.ensureCSRFToken())
      .then(() => mcBase.setStackIdFromUrl(activeTab.url as string))
      .then(() => mcJourneyBuilder.loadFromJourneyBuilderUrl(activeTab.url as string))
      .then(() => {
        if (mcJourneyBuilder.journeyData) {
          console.info(`Using ${mcJourneyBuilder.journeyData.name} version ${mcJourneyBuilder.journeyData.version}`)
        } else {
          console.error(`Load Journey Data from URL Failed.`)
        }
      })
      .then(() => mcJourneyBuilder.resolveEntryDataExtension())
      .then(() => getFromLocalStorage(['emailRecipients', 'emailSubjectPrefix']))
      .then((result) => {
        const { emailRecipients, emailSubjectPrefix } = result as { emailRecipients: string[], emailSubjectPrefix: string };
        return mcJourneyBuilder.sendAllEmailPreview({
          recipients: emailRecipients,
          prefix: emailSubjectPrefix
        })
      })
      .then(() => {
        console.info("DONE")
        sendResponse()
      })
      .catch((error) => {
        console.error(error.toString());
        sendResponse()
        throw error;
      });

  } else {
    throw new Error(`Unknow background action type ${message.type}`)
  }


  return true // indicate the async values will return
};

// list to tab switched
chrome.tabs.onActivated.addListener((tab: chrome.tabs.TabActiveInfo) => {
  // Tab switched event
  const tabId: number = tab.tabId;
  const windowId: number = tab.windowId;


  chrome.runtime.sendMessage({ type: 'TAB_SWITCHED',  data:{tabId, windowId, }});
});

// TODO: Send error message to side panel
// TODO: Create store to store things

// Add a message listener to handle messages from the content script
chrome.runtime.onMessage.addListener(handleMessageSendToServiceWorker);