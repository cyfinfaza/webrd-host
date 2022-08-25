const { ipcRenderer } = require("electron");

window.ipcRenderer = ipcRenderer;

ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
	console.log("got set source event");
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: "desktop",
					chromeMediaSourceId: sourceId,
				},
			},
		});
		handleStream(stream);
	} catch (e) {
		handleError(e);
	}
});

function handleStream(stream) {
	const video = document.querySelector("video");
	video.srcObject = stream;
	video.onloadedmetadata = (e) => video.play();
}

function handleError(e) {
	// console.log(e);
}
