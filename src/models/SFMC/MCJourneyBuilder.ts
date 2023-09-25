import type {
	MCJourneyData,
	MCJourneyTrigger,
	MCJourneyEventDefinition,
	MCJourneyEmailActivity,
	MCSendClassification,
	MCDeliveryProfile,
	MCSenderProfile,
	MCSendEmailPreviewResponse
} from './MCAPI.d.ts'

import { MCBaseFacet } from "./MCBaseFacet";
import { MCBase } from "./MCBase";
import _ from 'lodash'

export default class MCJourneyBuilder extends MCBaseFacet {
	public journeyId: string | undefined; // the journey identifier
	public versionNumber: number | undefined; // the journey identifier
	public journeyData: MCJourneyData | undefined;
	public entryDataExtensionId: string | undefined;
	public entryDataExtensionName: string | undefined;
	public sendClassications: MCSendClassification[] | undefined;
	public deliveryProfiles: MCDeliveryProfile[] | undefined;
	public senderProfiles: MCSenderProfile[] | undefined;

	constructor(mcBase: MCBase) {
		super(mcBase)
	}

	public async loadFromJourneyBuilderUrl(url: string) {
		// TODO Here
		// like this URL: https://mc.s50.exacttarget.com/cloud/#app/Journey%20Builder/%23e41003d8-1884-4362-91f2-7595c2b8b14c/1

		// https://jbinteractions.s50.marketingcloudapps.com/fuelapi/interaction/v1/interactions/d3a6a88c-40f0-4e42-95ec-2da5750d9366?extras=all&versionNumber=9&_=1691804126925
		// https://mc.s50.exacttarget.com/cloud/#app/Journey%20Builder/%23d3a6a88c-40f0-4e42-95ec-2da5750d9366/9

		// Regular expression to extract journey ID and version number
		const regex = /Journey%20Builder\/%23([\da-fA-F-]+)\/(\d+)/;
		const matches = url.match(regex);

		if (matches?.length !== 3) {
			throw new Error(`URL format doesn't match expected pattern. URL: ${url}`)
		}

		this.journeyId = matches[1];
		this.versionNumber = parseInt(matches[2]);

		console.log("Journey ID (UUID format):", this.journeyId);
		console.log("Version Number:", this.versionNumber);

		await this.loadJourneyLastVersion(this.journeyId, this.versionNumber)

		return this.journeyData
	}


	// journeyId is the id which show on the journey builder urls
	// the version also show on the urls
	// sample journey builder url
	public async loadJourneyLastVersion(journeyId: string, versionNumber: number) {
		// https://jbinteractions.s50.marketingcloudapps.com/fuelapi/interaction/v1/interactions/d3a6a88c-40f0-4e42-95ec-2da5750d9366?extras=all&versionNumber=9&_=1691804126925

		var journeyData: MCJourneyData =
			await this.getFetch(`https://jbinteractions.${this.mcBase.stackId}.marketingcloudapps.com/fuelapi/interaction/v1/interactions/${journeyId}?extras=all&versionNumber=${versionNumber}&_=${(new Date()).getTime()}`);

		this.journeyData = journeyData
		console.info(`Loaded Journey ${this.journeyData.name}`)
	}

	public async getJourneyVersions() {

	}

	public async getEntryDataExtension() {
		// return a data extension object
	}

	protected isJoruneyLoaded(): boolean {
		return !!this.journeyData
	}

	// know the entry trigger type
	public getTriggerType(): 'SalesforceObjectTriggerV2' | 'AutomationAudience' | 'EmailAudience' {
		if (!this.isJoruneyLoaded()) { throw new Error("Journey Data is not ready") }

		let firstTriggerType = _.get(this.journeyData, 'triggers.0.type')
		return firstTriggerType
	}

	public async resolveEntryDataExtension(): Promise<string> {
		if (!this.isJoruneyLoaded()) { throw new Error("Journey Data is not ready") }

		let triggerEventDefId = this.journeyData?.triggers[0].metaData.eventDefinitionId
		// console.log('triggerEventDefId', triggerEventDefId)
		if (!triggerEventDefId) { throw new Error("Cannot find journey trigger from Journey Data") }

		let journeyEventDefinition: MCJourneyEventDefinition = await this.getEventDefinition(triggerEventDefId)
		// console.log('journeyEventDefinition', journeyEventDefinition)
		if (!journeyEventDefinition) { throw new Error(`Cannot find journey trigger event definition by eventId ${triggerEventDefId}`) }

		this.entryDataExtensionId = journeyEventDefinition.dataExtensionId
		this.entryDataExtensionName = journeyEventDefinition.dataExtensionName
		console.log('dataExtensionId', this.entryDataExtensionId, this.entryDataExtensionName)

		// TODO: Fetch the data extension Id

		return this.entryDataExtensionId
	}

	public async getEventDefinition(eventDefId: string): Promise<MCJourneyEventDefinition> {
		// https://jbinteractions.s50.marketingcloudapps.com/fuelapi/interaction/v1/eventDefinitions/33EE8C74-7BDC-49B5-83B3-B4B8882E06C8?_=1691824684746

		let journeyEventDefinition: MCJourneyEventDefinition =
			await this.getFetch(`https://jbinteractions.${this.mcBase.stackId}.marketingcloudapps.com/fuelapi/interaction/v1/eventDefinitions/${eventDefId}?_=${(new Date()).getTime()}`);

		return journeyEventDefinition
	}

	public getEmailActivties(): MCJourneyEmailActivity[] {
		if (!this.isJoruneyLoaded()) { throw new Error("Journey Data is not ready") }

		let emailActs: MCJourneyEmailActivity[] =
			this.journeyData?.activities?.filter(act => act.type === "EMAILV2") as MCJourneyEmailActivity[]

		return emailActs
	}

	public async sendAllEmailPreview({recipients, prefix}:{recipients:string[] ,prefix?:string}) {
		// prepare the payload
		let emailActs = this.getEmailActivties()
		let dataSource = await this.resolveSendEmailDataSource()

		for (let i = 0; i < emailActs.length; i++) {
			const emailAct = emailActs[i];
			const emailId = emailAct.configurationArguments.triggeredSend.emailId
			console.info(`Sending ${emailId}(${emailAct.configurationArguments.triggeredSend.emailSubject})`)

			let sendManagement = await this.resolveEmailSendManagement()
			let payload = {
					"emailID": emailId,
					"subjectPrefix": prefix?? 'Test:',
					"trackLinks": true,
					"suppressTracking": true,
					"options": {
						"EnableETURLs": "true"
					},
					"recipients": recipients,
					"isMultipart": true,
					"dataSource": dataSource,
					"sendManagement": sendManagement
				}

			let sendResponse:MCSendEmailPreviewResponse = await this.postFetch(`https://content-builder.${this.mcBase.stackId}.marketingcloudapps.com/fuelapi/guide/v1/emails/preview/send`, payload)
			console.log('sendResponse', sendResponse)
		}
	}

	/**
	 * Fetch send email required profiles.
	 */
	public async fetchSendProfiles() {
		// Sender Profile
		let senderProfileResponse =
			await this.getFetch(`https://content-builder.${this.mcBase.stackId}.marketingcloudapps.com/fuelapi/messaging-internal/v1/senderProfiles?$page=1&$pagesize=100`);
		this.senderProfiles = senderProfileResponse.items

		// Delivery Profile
		let deliveryProfilesResponse =
			await this.getFetch(`https://content-builder.${this.mcBase.stackId}.marketingcloudapps.com/fuelapi/messaging-internal/v1/deliveryProfiles?$page=1&$pagesize=100`);
		this.deliveryProfiles = deliveryProfilesResponse.items

		// SEND CLASSIFICATION sendClassificationID // commercial or transactional
		let sendClassificationResponse =
			await this.getFetch(`https://content-builder.${this.mcBase.stackId}.marketingcloudapps.com/fuelapi/messaging-internal/v1/sendclassifications?$page=1&$pagesize=100`);
		this.sendClassications = sendClassificationResponse.items
	}

	public async resolveEmailSendManagement():
		Promise<{ sendClassificationID: string, senderProfileID: string, deliveryProfileID: string }> {
		if (!this.senderProfiles) {
			await this.fetchSendProfiles()
		}

		let targetSenderProfile: MCSenderProfile | undefined = this.senderProfiles?.filter(p => {
			return p.status === "Verified" && p.isActive && p.isSendable
		})[0]

		let targetDeliveryProfile: MCDeliveryProfile | undefined = this.deliveryProfiles?.filter(p => {
			return p.isActive
		})[0]

		let targetSendClassification: MCSendClassification | undefined = this.sendClassications?.filter(p => {
			return p.isActive && p.sendClassificationType === "Operational"
		})[0]

		if (!targetSenderProfile || !targetDeliveryProfile || !targetSendClassification) {
			throw new Error("Cannot determine sendProfile, deliveryProfile or sendClassiication")
		}

		return {
			"sendClassificationID": targetSendClassification.id,
			"senderProfileID": targetSenderProfile.id,
			"deliveryProfileID": targetDeliveryProfile.id
		}
	}

	protected async resolveSendEmailDataSource(): Promise<{type:string, id:string, row:string}> {
		// https://content-builder.s50.marketingcloudapps.com/fuelapi/data-internal/v1/customObjectData/78514336-c600-ed11-a5b5-f40343dfba20?showKey=true&$page=1&$pagesize=25
		// SEND CLASSIFICATION sendClassificationID // commercial or transactional
		let senderDataExtensionResponse =
			await this.getFetch(`https://content-builder.${this.mcBase.stackId}.marketingcloudapps.com/fuelapi/data-internal/v1/customObjectData/${this.entryDataExtensionId}?showKey=true&$page=1&$pagesize=25`);


		if (senderDataExtensionResponse.items.length==0) {
			console.warn('senderDataExtensionResponse.items.length', senderDataExtensionResponse.items.length)
			throw new Error('Data Extension must contains at least one row to preview')
		}

		let candidateDataSource = senderDataExtensionResponse.items[senderDataExtensionResponse.items.length-1]

		console.log('Candidate send data source', candidateDataSource)
		return {
			"type": "DataExtension",
			"id": this.entryDataExtensionId,
			"row": candidateDataSource.customObjectKey // customObjectKey
		}
	}
}

export class DataExtension extends MCBase {
	public parent: MCBase | null = null;
	public dataExtensionId: string | null = null;

	public async getRows() {
		// max 2000 rows
	}
}