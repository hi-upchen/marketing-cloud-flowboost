import 'src/vendors/fontawesome/css/all.min.css';
import "./sidepanel.css";

import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import ConsolePanel from "./ConsolePanel/ConsolePanel";

import { getActiveTab, resolveStackIdFromURL } from 'src/models/SFMC/utils'
import type { MCJourneyData } from 'src/models/SFMC/MCAPI.d.ts'
import 'src/types/background.d.ts'


const App: React.FC = () => {
  let [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  let [emailSubjectPrefix, setEmailSubjectPrefix] = useState<string>("");

  const handleSendEmailsInJourney = (event: React.MouseEvent<HTMLButtonElement>) => {
    return chrome.runtime.sendMessage({ type: 'SEND_EMAILS_BY_JOURNEY_URL' })
  }

  const handleListCookie = (event: React.MouseEvent<HTMLButtonElement>) => {
    chrome.runtime.sendMessage({ type: '_LIST_COOKIES' })
  }

  const handleEnsureCSRF = (event: React.MouseEvent<HTMLButtonElement>) => {
    chrome.runtime.sendMessage({ type: '_ENSURE_CSRF' })
  }

  const handleGenerateError = (event: React.MouseEvent<HTMLButtonElement>) => {
    chrome.runtime.sendMessage({ type: '_GENERATE_AN_ERROR' })
  }

  // handle email recipient change and save to storage
  const handleEmailRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let emails = event.target.value.split(',').map(element => element.trim());
    setEmailRecipients(emails);
    chrome.storage.local.set({ emailRecipients: emails });
  };

  // load the saved email recipients
  useEffect(() => {
    chrome.storage.local.get("emailRecipients", (data) => {
      const emailRecipients = data.emailRecipients || [];
      setEmailRecipients(emailRecipients); // Update the state with the stored value
    });
  }, []);

  // handle email subject prefix
  const handleEmailSubjectPrefixChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let prefix = event.target.value
    setEmailSubjectPrefix(prefix);
    chrome.storage.local.set({ emailSubjectPrefix: prefix });
  };

  // load the saved email subject prefix
  useEffect(() => {
    chrome.storage.local.get("emailSubjectPrefix", (data) => {
      const emailSubjectPrefix = data.emailSubjectPrefix;
      setEmailSubjectPrefix(emailSubjectPrefix); // Update the state with the stored value
    });
  }, []);

  return (
    <div className="App m-3">
      <div className="form-control w-full max-w-xs prose">
        <h2>Send Journey All Email Previews</h2>

        <label className="label justify-start">
          <span className="label-text">Recipients</span>
          <span className="label-text tooltip mx-1 before:w-[10rem] before:content-[attr(data-tip)]" data-tip="Maximum 5 email addresses, separated by commas.">
            <i className="fa-solid fa-circle-info"></i>
          </span>
        </label>
        <input
          type="text"
          placeholder="your_email@gmail.com"
          className="input input-bordered w-full max-w-xs"
          value={emailRecipients.join(", ")}
          onChange={handleEmailRecipientChange}
        />


        <label className="label justify-start mt-3">
          <span className="label-text">Subject Prefix</span>
          <span className="label-text tooltip mx-1 before:w-[10rem] before:content-[attr(data-tip)]" data-tip="Add the prefix for the test email's subject line.">
            <i className="fa-solid fa-circle-info"></i>
          </span>
        </label>

        <input
          type="text"
          placeholder="[Test] "
          className="input input-bordered w-full max-w-xs"
          value={emailSubjectPrefix}
          onChange={handleEmailSubjectPrefixChange}
        />
      </div>

      <button className={"btn btn-primary mt-5 w-full max-w-xs"} onClick={handleSendEmailsInJourney}>SEND_EMAILS</button>

      <hr />

      <div className="hidden">
        <button className="btn btn-default" onClick={handleListCookie}>List Cookies</button>
        <button className="btn btn-default" onClick={handleEnsureCSRF}>Ensure CSRF</button>
        <button className="btn btn-default" onClick={handleGenerateError}>GenerateError</button>
      </div>

      <h1>Console Logs</h1>
      <ConsolePanel />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));