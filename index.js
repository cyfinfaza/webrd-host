const { app, BrowserWindow, desktopCapturer, ipcMain } = require("electron");

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

	setTimeout(() => {
		console.log("getting sources");
		desktopCapturer
			.getSources({ types: ["window", "screen"] })
			.then(async (sources) => {
				console.log("got sources");
				for (const source of sources) {
					if (source.name === "Screen 1") {
						win.webContents.send("SET_SOURCE", source.id);
						return;
					}
				}
			});
	}, 2000);

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
