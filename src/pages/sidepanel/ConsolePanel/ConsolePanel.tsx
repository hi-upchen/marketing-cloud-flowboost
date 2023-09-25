import React, { useEffect, useState, useRef } from "react";
import './ConsolePanel.scss'
import { format } from 'date-fns';

interface LogRowInterafce {
	level: 'log' | 'info' | 'warn' | 'error',
	timestamp: Number,
	payload: any
}

const renderALog = (logRow: LogRowInterafce) => {
	// resolve main messages
	let s = ""
	for (let i = 0; i < logRow.payload.length; i++) {
		let a = logRow.payload[i]
		if (typeof (a) === "string") {
			s += a.toString() + " "
		} else {
			s += JSON.stringify(a) + " "
		}

	}

	s = format(logRow.timestamp, 'HH:mm:ss') + " " + s.trim()
	s = s.trim()

	return s
}

const ConsolePanel: React.FC = () => {
	let [logs, setLogs] = useState<LogRowInterafce[]>([]);
	const consoleRef = useRef(null)

	useEffect(() => {
		// Listen for updates from background script
		chrome.runtime.onMessage.addListener((message) => {
			if (message.action === "updateLogs") {
				setLogs(message.logs);

				// Scroll to the bottom when new logs arrive
				if (consoleRef.current) {
					consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
				}
			}
		});
	}, []); // Empty dependency array to run the effect only once

	return (<div className="console-panel">
		<div className="console-logs" ref={consoleRef}>
			{logs.map((s, idx) => {
				return (<div className={"log-row " + s.level} key={idx}>{renderALog(s)}</div>)
			})}
		</div>
	</div>)
}


export default ConsolePanel
