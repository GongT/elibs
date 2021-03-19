const { app, BrowserWindow } = require('electron');
const { resolve } = require('path');
const { initTabUIMainProcess } = require('@gongt/tabui/main');

app.on('ready', () => {
	initTabUIMainProcess();

	const win = new BrowserWindow({
		width: 1600,
		height: 800,
		webPreferences: {
			contextIsolation: false,
			enableRemoteModule: false,
			nodeIntegration: true,
			preload: resolve(__dirname, 'preload.cjs'),
		},
	});
	win.webContents.openDevTools();
	win.loadFile('index.html');
});
