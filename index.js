const { app, BrowserWindow, desktopCapturer, ipcMain } = require("electron");
const { mouse, Point, screen, keyboard } = require("@nut-tree/nut-js");
const { Button } = require("@nut-tree/nut-js");
const { mapToKey } = require("./src/lib/keyMapping");

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
		win.loadFile("ui-build/index.html");
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

ipcMain.handle("handleMouse", async (event, mouseEvent) => {
	if (typeof mouseEvent.x === "number" && typeof mouseEvent.y === "number") {
		const target = new Point(
			mouseEvent.x * screenWidth,
			mouseEvent.y * screenHeight
		);
		await mouse.setPosition(target);
	}
	if (typeof mouseEvent.buttons === "number") {
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
	}
	if (mouseEvent.deltaY) await mouse.scrollDown(mouseEvent.deltaY);
	if (mouseEvent.deltaX) await mouse.scrollLeft(mouseEvent.deltaX);
});

ipcMain.handle("handleKeyboard", async (event, keyboardEvent) => {
	// console.log("Keyboard event", keyboardEvent);
	const key = mapToKey(keyboardEvent.key);
	if (keyboardEvent.down) {
		// console.log("Pressing key", key);
		keyboard.pressKey(key);
	} else if (true && !keyboardEvent.down) {
		// console.log("Releasing key", key);
		keyboard.releaseKey(key);
	}
	// console.log(pressedKeys);
});

(async () => {
	keyboard.config.autoDelayMs = 0;
	screenWidth = await screen.width();
	screenHeight = await screen.height();
	console.log(`Screen dimensions: ${screenWidth}x${screenHeight}`);
})();
