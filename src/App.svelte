<script>
	const { ipcRenderer } = require("electron");
	import { hostConfig } from "./lib/stores";
	import {
		mqttConnect,
		BASE_TOPIC,
		clientID,
		connected,
		mqttConfig,
		mqttClient,
		disconnect,
	} from "./lib/mqtt";

	import BooleanIndicator from "./components/BooleanIndicator.svelte";
	import Labeled from "./components/Labeled.svelte";

	let myVideoElement;
	let myVideo = new MediaStream();

	async function startMedia() {
		console.log("Media: Requesting sources");
		const videoSources = await ipcRenderer.invoke("requestSources");
		console.log("Media: Got sources, using first", videoSources);
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: "desktop",
					chromeMediaSourceId: videoSources[0].id,
				},
			},
		});
		myVideo = stream;
		myVideoElement.srcObject = stream;
		myVideoElement.onloadedmetadata = () => myVideoElement.play();
		console.log("Media: Stream acquired", stream);
	}

	const connections = {};

	async function startConnection(offer) {
		let connectedTo = "";
		const pc = new RTCPeerConnection({
			iceServers: [
				{ urls: "stun:stun.l.google.com:19302" },
				{
					urls: "turn:numb.viagenie.ca",
					credential: "muazkh",
					username: "webrtc@live.com",
				},
			],
		});

		connections[offer.from] = pc;
		connections = connections;
		pc.ondatachannel = (e) => {
			console.log("WebRTC: Data channel established", e);
			e.channel.onopen = () => {
				console.log("WebRTC: Data channel open");
			};
			e.channel.onmessage = (e) => {
				// console.log("WebRTC: Data channel message", e);
				const data = JSON.parse(e.data);
				if (data.type === "mouse" && ($hostConfig.acceptMouseInput ?? false))
					ipcRenderer.invoke("handleMouse", data);
				if (
					data.type === "keyboard" &&
					($hostConfig.acceptKeyboardInput ?? false)
				)
					ipcRenderer.invoke("handleKeyboard", data);
			};
		};
		pc.onicecandidate = (e) => {
			console.log("WebRTC: Sending new local ICE candidate", e);
			mqttClient.send(
				BASE_TOPIC + "clients/" + connectedTo + "/iceCandidate",
				JSON.stringify(e.candidate)
			);
		};
		pc.onconnectionstatechange = (e) => {
			console.log("WebRTC: Connection state changed", pc.connectionState);
			if (pc.connectionState === "connected") {
				const sender = pc.getSenders()[0];
				const parameters = sender.getParameters();
				console.log(sender, parameters);
				parameters.encodings[0].maxBitrate = 200 * 1000 * 1000;
				sender.setParameters(parameters);
			}
		};
		myVideo.getTracks().forEach((track) => {
			pc.addTrack(track, myVideo);
		});
		console.log("WebRTC: Got offer from " + offer.from, offer.sdp);
		connectedTo = offer.from;
		await pc.setRemoteDescription(offer.sdp);
		const answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		console.log("WebRTC: Answering", answer);
		await mqttClient.send(
			BASE_TOPIC + "clients/" + connectedTo + "/answer",
			JSON.stringify(answer)
		);
	}

	async function onMessageArrived(message) {
		console.log("MQTT: Message arrived", message);
		const topic = message.destinationName.split("/");
		if (topic[3] === "offer") {
			const offer = JSON.parse(message.payloadString);
			startConnection(offer);
		} else if (topic[3] === "iceCandidate") {
			const candidate = JSON.parse(message.payloadString);
			console.log(
				"WebRTC: Received remote ICE candidate from " + candidate.from,
				candidate.candidate
			);
			connections[candidate.from].addIceCandidate(candidate.candidate);
		} else if (topic[1] === "disconnect") {
			console.log(
				"MQTT: Received disconnect message from " + message.payloadString
			);
			if (connections[message.payloadString]) {
				console.log("WebRTC: Closing connection to " + message.payloadString);
				connections[message.payloadString].close();
				delete connections[message.payloadString];
				connections = connections;
			}
		}
	}

	startMedia();

	if ($mqttConfig.autoConnect) {
		mqttConnect(onMessageArrived);
	}
</script>

<main>
	<div>
		<h1>WebRD Host</h1>
		<h3>{clientID}</h3>
		<p>
			MQTT: <BooleanIndicator
				state={$connected}
				trueMessage="Connected"
				falseMessage="Disconnected"
			/>
		</p>
		<video
			class="sendPreview"
			bind:this={myVideoElement}
			on:loadedmetadata={(e) => e.target.play()}
			controls
		/>
		<h2>Connected Clients</h2>
		<ul>
			{#each Object.keys(connections) as client}
				<li>{client}</li>
			{/each}
		</ul>
	</div>
	<div>
		<h2>MQTT Config</h2>
		<div class="config">
			<Labeled label="Host: ">
				<input
					type="text"
					bind:value={$mqttConfig.host}
					placeholder="mq02.cy2.me"
				/>
			</Labeled>
			<Labeled label="Port: ">
				<input type="number" bind:value={$mqttConfig.port} placeholder="443" />
			</Labeled>
			<Labeled label="Basepath: ">
				<input
					type="text"
					bind:value={$mqttConfig.basepath}
					placeholder="/mqtt"
				/>
			</Labeled>
			<Labeled label="Use SSL? ">
				<input type="checkbox" bind:checked={$mqttConfig.useSsl} />
			</Labeled>
			<Labeled label="Use authentication? ">
				<input type="checkbox" bind:checked={$mqttConfig.useAuth} />
			</Labeled>
			{#if $mqttConfig.useAuth}
				<Labeled label="Username: ">
					<input
						type="text"
						bind:value={$mqttConfig.username}
						placeholder="admin"
					/>
				</Labeled>
				<Labeled label="Password: ">
					<input
						type="password"
						bind:value={$mqttConfig.password}
						placeholder="password"
					/>
				</Labeled>
			{/if}
			<Labeled label="Auto connect? ">
				<input type="checkbox" bind:checked={$mqttConfig.autoConnect} />
			</Labeled>
			<button on:click={() => mqttConnect(onMessageArrived)}>Connect now</button
			>
			<button on:click={() => disconnect()}>Disconnect now</button>
		</div>
	</div>
	<div>
		<h2>Host Config</h2>
		<div class="config">
			<Labeled label="Device Name: ">
				<input
					type="text"
					bind:value={$hostConfig.deviceName}
					placeholder="Computer"
				/>
			</Labeled>
			<Labeled label="Accept mouse input? ">
				<input type="checkbox" bind:checked={$hostConfig.acceptMouseInput} />
			</Labeled>
			<Labeled label="Accept keyboard input? ">
				<input type="checkbox" bind:checked={$hostConfig.acceptKeyboardInput} />
			</Labeled>
		</div>
	</div>
</main>

<style>
	main {
		width: 100%;
		height: 100%;
		padding: 12px;
		gap: 24px;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		box-sizing: border-box;
	}
	.sendPreview {
		width: 100%;
	}
	.config {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
</style>
