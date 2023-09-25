// classes

export interface MCBase {
	getFetch(url: string): Promise<any>;
	isAuthed(): boolean;
}

// data types
export interface MCUserData {
	id: string;
	key: string;
	lastUpdated: string;
	createdDate: string;
	username: string;
	account: {
		accounttypeid: number;
		accounttypename: string;
	};
	businessUnitAccountTypeId: number;
	businessUnitId: number;
	defaultBusinessunitid: number;
	email: string;
	isEtAdmin: boolean;
	locale: string;
	name: string;
	timeZone: {
		id: number;
		key: string;
		name: string;
		shortDescription: string;
	};
	utcOffset: string;
}

export interface MCJourneyOutcome {
	key: string;
	next: string;
	arguments: Record<string, any>;
	metaData: {
		label: string;
		skipI18n: boolean;
		isLabelFromConversion: boolean;
		criteriaDescription: string;
		invalid: boolean;
	};
}

export interface MCJourneyActivity {
	id: string;
	key: string;
	name: string;
	description: string;
	type: string;
	outcomes: MCJourneyOutcome[];
	arguments: Record<string, any>;
	configurationArguments: Record<string, any>;
	metaData: {
		isConfigured: boolean;
		expressionBuilderPrefix?: string;
	};
	schema: Record<string, any>
}

export interface MCJourneyEmailActivity {
	id: string;
	key: string;
	name: string;
	description: string;
	type: 'EMAILV2';
	outcomes: MCJourneyOutcome[];
	arguments: Record<string, any>;
	configurationArguments: {
		triggeredSend: {
			autoAddSubscribers: boolean;
			autoUpdateSubscribers: boolean;
			bccEmail: string;
			ccEmail: string;
			created: Record<string, any>;
			domainExclusions: any[]; // This could be a more specific type if known
			dynamicEmailSubject: string; // eg "不只全球，臺灣也可以一同守護海洋！"
			emailId: number; // eg 9068
			emailSubject: string; // eg "不只全球，臺灣也可以一同守護海洋！"
			exclusionFilter: string;
			isSalesforceTracking: boolean;
			isMultipart: boolean;
			isSendLogging: boolean;
			isStoppedOnJobError: boolean;
			modified: Record<string, any>;
			priority: number;
			sendClassificationId: string;
			deliveryProfileId: string;
			senderProfileId: string;
			isTrackingClicks: boolean;
			publicationListId: number;
			name: string; // eg email_a4 - b387aec6085f4fb688a5219296bc1728
			preHeader: string;
			description: string; // eg email_a4 - a5bfc4106bb74d4190a8418a8741d61a
			suppressTracking: boolean;
			keyword: string;
			throttleLimit: number;
			campaigns: any[]; // This could be a more specific type if known
			suppressionLists: any[]; // This could be a more specific type if known
		};
		triggeredSendId: string; // eg 90cc7593-1c0f-ee11-a5e9-f40343dfba20
		triggeredSendKey: string; // eg 57432
		isModified: boolean;
		isSimulation: boolean;
		googleAnalyticsCampaignName: string;
		useLLTS: boolean;
		fuelAgentRequested: boolean;
		applicationExtensionKey: string;
	};
	metaData: Record<string, any>;
	schema: Record<string, any>;
}

export interface MCJourneyTrigger {
	id: string;
	key: string;
	name: string;
	description: string;
	type: 'SalesforceObjectTriggerV2' | 'EmailAudience' | 'AutomationAudience';
	outcomes: any[]; // Define the outcomes type if available
	arguments: {
		startActivityKey: string;
		dequeueReason: string;
		lastExecutedActivityKey: string;
		filterResult: string;
	};
	configurationArguments: {
		applicationExtensionKey?: string;
		version?: string;
		objectApiName?: string;
		salesforceTriggerCriteria?: string;
		eventDataConfig?: {
			objects: {
				dePrefix: string;
				isPolymorphic: boolean;
				referenceObject: string;
				relationshipName: string;
				relationshipIdName: string;
				fields: string[];
			}[];
		};
		primaryObjectFilterCriteria?: {
			operand: string;
			conditions: {
				_length?: number;
				dataType: string;
				fieldName: string;
				folderId: string;
				id: string;
				isPolymorphic: boolean;
				name: string;
				operator: string;
				precision: number;
				referenceObjectName: string;
				relationshipIdName: string;
				relationshipName: string;
				scale: number;
				text: string;
				value?: string;
			}[];
		};
		relatedObjectFilterCriteria?: {
			operand: string;
			conditions: any[]; // Define the conditions type if available
		};
		additionalObjectFilterCriteria?: string;
		contactKey?: {
			relationshipIdName: string;
			relationshipName: string;
			isPolymorphic: boolean;
			referenceObjectName: string;
			fieldName: string;
		};
		passThroughArgument?: {
			fields: Record<string, string>;
		};
		primaryObjectFilterSummary?: string;
		relatedObjectFilterSummary?: string;
		eventDataSummary?: string;
		evaluationCriteriaSummary?: string;
		contactPersonType?: string;
		whoToInject?: string;
		schemaVersionId?: number;
		criteria?: string;
		filterDefinitionId?: string;
	};
	metaData: {
		sourceInteractionId?: string;
		eventDefinitionId: string;
		eventDefinitionKey: string;
		chainType: string;
		configurationRequired: boolean;
		iconUrl: string;
		title: string;
		entrySourceGroupConfigUrl: string;
		category?: string;
	};
}

export interface MCJourneyData {
	id: string;
	key: string;
	name: string;
	lastPublishedDate: string;
	description: string;
	version: number;
	workflowApiVersion: number;
	createdDate: string;
	modifiedDate: string;
	activities: (MCJourneyActivity|MCJourneyEmailActivity)[];
	triggers: MCJourneyTrigger[]; // You can replace "any" with a more specific type if available
	goals: any[]; // You can replace "any" with a more specific type if available
	exits: any[]; // You can replace "any" with a more specific type if available
	notifiers: any[]; // You can replace "any" with a more specific type if available
	stats: {
		currentPopulation: number;
		cumulativePopulation: number;
		metGoal: number;
		metExitCriteria: number;
		goalPerformance: number;
	};
	entryMode: string;
	definitionType: string;
	channel: string;
	defaults: {
		email: string[];
		mobileNumber: string[];
		properties: {
			analyticsTracking: {
				enabled: boolean;
				analyticsType: string;
				urlDomainsToTrack: string[];
			};
		};
	};
	metaData: {
		hasCopiedActivity: boolean;
		dataSource: string;
	};
	executionMode: string;
	categoryId: number;
	status: string;
	definitionId: string;
	scheduledStatus: string;
}

export interface MCJourneyEventDefinition {
	id: string;
	type: string;
	name: string;
	description: string;
	createdDate: string;
	createdBy: number;
	modifiedDate: string;
	modifiedBy: number;
	mode: string;
	eventDefinitionKey: string;
	dataExtensionId: string;
	dataExtensionName: string;
	schema: {
		id: string;
		name: string;
		fields: {
			name: string;
			dataType: string;
			maxLength?: string;
			isNullable: boolean;
			defaultValue?: string;
			isPrimaryKey: boolean;
			isDevicePreference: boolean;
		}[];
		sendableCustomObjectField: string;
		sendableSubscriberField: string;
		isPlatformObject: boolean;
	};
	sourceApplicationExtensionId: string;
	filterDefinitionId: string;
	filterDefinitionTemplate: string;
	iconUrl: string;
	arguments: {
		serializedObjectType: number;
		useHighWatermark: boolean;
		eventDefinitionId: string;
		eventDefinitionKey: string;
		dataExtensionId: string;
		criteria: string;
	};
	configurationArguments: {
		applicationExtensionKey: string;
		contactKey: string;
		contactPersonType: string;
		evaluationCriteriaSummary: string;
		eventDataConfig: string;
		eventDataSummary: string;
		objectAPIName: string;
		passThroughArgument: string;
		primaryObjectFilterCriteria: string;
		primaryObjectFilterSummary: string;
		relatedObjectFilterCriteria: string;
		relatedObjectFilterSummary: string;
		salesforceTriggerCriteria: string;
		version: string;
		whoToInject: string;
	};
	metaData: {
		criteriaDescription: string;
		scheduleState: string;
	};
	interactionCount: number;
	isVisibleInPicker: boolean;
	isPlatformObject: boolean;
	category: string;
	publishedInteractionCount: number;
	automationId: string;
	disableDEDataLogging: boolean;
}

export interface MCSendClassification {
	id: string;
	key: string;
	name: string;
	description: string;
	sendClassificationType: "Marketing" | "Operational"; // Assuming there are only these two types
	senderProfileId: string;
	deliveryProfileId: string;
	honorPublicationListOptOutsForTransactionalSends: boolean;
	sendPriority: string // eg Normal
	validateCustomSubstitutionStrings: boolean;
	jobHighAvailabilityType: string; // "None"
	isActive: boolean;
	createdDate: string;
	createdBy: number;
	modifiedDate: string;
	modifiedBy: number;
}

export interface MCDeliveryProfile {
	id: string;
	key: string;
	name: string; // eg Default
	description: string;
	deliveryProfileType: string; // Default
	sourceAddressType: string;  // DefaultPrivateIPAddress
	memberSourceAddressId: number;
	domainType: string; // DefaultDomain
	privateDomainId: string;
	headerSalutationSource: string;
	headerContentAreaId: number;
	footerSalutationSource: string;
	footerContentAreaId: number;
	subscriberLevelPrivateDomain: boolean;
	sMIMESignatureCertificateCustomerKey: string;
	privateDomainSetCustomerKey: string;
	createdDate: string;
	createdBy: number;
	modifiedDate: string;
	modifiedBy: number;
	isActive: boolean;
	ipAddress: string;
}

export interface MCSenderProfile {
	id: string;
	type: string; // "Channel"
	key: string;
	memberId: number; // buId, 510000968
	name: string;
	isActive: boolean;
	fromName: string;
	fromEmail: string;
	createdDate: string;
	createdBy: number;
	modifiedDate: string;
	modifiedBy: number;
	useDefaultRMMRules: boolean;
	autoForwardEmail: string;
	autoForwardName: string;
	autoReply: boolean;
	directForward: boolean;
	isSendable: boolean;
	status: string; // eg Verified, "Not Verified"
}

export interface MCSendEmailPreviewResponse {
  emailID: string;
  dataSource: {
    type: string;
    id: string;
    row: number;
  };
  recipients: string[];
  sendManagement: {
    sendClassificationID: string;
    senderProfileID: string;
    deliveryProfileID: string;
  };
  sendID: number;
  jobID: number;
  sendScheduledTime: string;
  trackLinks: boolean;
  suppressTracking: boolean;
  isMultipart: boolean;
  options: {
    enableETURLs: string;
  };
}