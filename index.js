const { app, BrowserWindow, desktopCapturer, ipcMain } = require("electron");
const { mouse, Point, screen } = require("@nut-tree/nut-js");
const { Button } = require("@nut-tree/nut-js");

let screenWidth = 0;
let screenHeight = 0;

const createWindow = () => {
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			// preload: __dirname + "/preload.js",
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (process.env.IS_DEV === "true") {
		win.loadURL("http://localhost:5184/");
	} else {
		// load your file
		win.loadFile("dist/index.html");
	}

	// setTimeout(() => {
	// 	console.log("getting sources");
	// 	desktopCapturer
	// 		.getSources({ types: ["window", "screen"] })
	// 		.then(async (sources) => {
	// 			console.log("got sources");
	// 			for (const source of sources) {
	// 				if (source.name === "Screen 1") {
	// 					win.webContents.send("SET_SOURCE", source.id);
	// 					return;
	// 				}
	// 			}
	// 		});
	// }, 2000);

	// setTimeout(() => {
	// 	console.log("getting sources");
	// 	desktopCapturer.getSources({ types: ["screen"] }).then(async (sources) => {
	// 		console.log("got sources");
	// 		win.webContents.send("SET_SOURCES", sources);
	// 	});
	// }, 2000);
};

app.whenReady().then(() => {
	createWindow();
});

ipcMain.handle("requestSources", async () => {
	console.log("getting sources");
	return await desktopCapturer.getSources({ types: ["screen"] });
});

const buttonState = { LEFT: 0, RIGHT: 0, MIDDLE: 0 };

ipcMain.handle("handleMouse", async (event, mouseEventString) => {
	const mouseEvent = JSON.parse(mouseEventString);
	const target = new Point(
		mouseEvent.x * screenWidth,
		mouseEvent.y * screenHeight
	);
	mouse.setPosition(target);
	const newButtonState = {
		LEFT: mouseEvent.buttons % 2,
		RIGHT: (mouseEvent.buttons >> 1) % 2,
		MIDDLE: (mouseEvent.buttons >> 2) % 2,
	};
	// console.log(newButtonState);
	for (let buttonIndex in Object.keys(newButtonState)) {
		const button = Object.keys(newButtonState)[buttonIndex];
		// console.log(button, newButtonState[button], buttonState[button]);
		if (newButtonState[button] !== buttonState[button]) {
			if (newButtonState[button]) {
				mouse.pressButton(Button[button]);
			} else {
				mouse.releaseButton(Button[button]);
			}
			buttonState[button] = newButtonState[button];
		}
	}
});
(async () => {
	screenWidth = await screen.width();
	screenHeight = await screen.height();
	console.log(`Screen dimensions: ${screenWidth}x${screenHeight}`);
})();
