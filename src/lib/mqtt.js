import Paho from "paho-mqtt";
import { writable, get } from "svelte/store";
import { hostConfig } from "./stores";

export const clientID = "webrd-host-" + parseInt(Math.random() * 10000000);

export const BASE_TOPIC = "webrd/";

export const connected = writable(false);
export const mqttConfig = writable(
	JSON.parse(window.localStorage.getItem("mqttConfig") || '{"useSsl":true}')
);
mqttConfig.subscribe((config) => {
	window.localStorage.setItem("mqttConfig", JSON.stringify(config));
});

export let mqttClient;

/**
 *
 * @param {function} onMessageArrived
 * @returns {Paho.Client}
 */
export function mqttConnect(onMessageArrived) {
	return new Promise((resolve, reject) => {
		try {
			mqttClient.disconnect();
		} catch (e) {
			console.log(e);
		}
		console.log("MQTT: Connecting as " + clientID);
		const config = get(mqttConfig);
		mqttClient = new Paho.Client(
			config.host || "mq02.cy2.me",
			config.port || 443,
			config.basepath || "/mqtt",
			clientID
		);
		let willMessage = new Paho.Message(new ArrayBuffer(0));
		willMessage.retained = true;
		willMessage.destinationName = BASE_TOPIC + "advertise/" + clientID;
		mqttClient.onMessageArrived = onMessageArrived;
		mqttClient.onConnectionLost = onFailure;
		/** @type {Paho.ConnectionOptions} */
		let connectionOptions = {
			onSuccess: onConnect,
			onFailure: onFailure,
			useSSL: config.useSsl,
			willMessage: willMessage,
			reconnect: true,
			keepAliveInterval: 65,
			// mqttVersion: 3,
			// uris: ["wss://mq03.cy2.me/mqtt"],
		};
		if (config.useAuth ?? false) {
			connectionOptions.userName = config.username;
			connectionOptions.password = config.password;
		} else {
			delete connectionOptions.userName;
			delete connectionOptions.password;
		}
		function onFailure(e) {
			console.error("MQTT: Connection failed", e);
			connected.update((_) => false);
			// setTimeout(() => {
			// 	mqttClient.connect(connectionOptions);
			// }, 2000);
		}
		function onConnect() {
			connected.update((_) => true);
			mqttClient.subscribe(BASE_TOPIC + "hosts/" + clientID + "/#");
			mqttClient.subscribe(BASE_TOPIC + "disconnect");
			mqttClient.send(
				BASE_TOPIC + "advertise/" + clientID,
				JSON.stringify({
					connected: true,
					name: get(hostConfig).deviceName || "Computer",
				}),
				0,
				true
			);
			console.log("MQTT: Connected as " + clientID);
			resolve(mqttClient);
		}
		mqttClient.connect(connectionOptions);
	});
}

hostConfig.subscribe((config) => {
	if (mqttClient && mqttClient.isConnected()) {
		mqttClient.send(
			BASE_TOPIC + "advertise/" + clientID,
			JSON.stringify({
				connected: true,
				name: config.deviceName || "Computer",
			}),
			0,
			true
		);
	}
});
