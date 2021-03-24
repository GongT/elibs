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
	win.loadFile('index.html', { query: { id: 1 } });

	const win2 = new BrowserWindow({
		width: 1600,
		height: 800,
		webPreferences: {
			contextIsolation: false,
			enableRemoteModule: false,
			nodeIntegration: true,
			preload: resolve(__dirname, 'preload.cjs'),
		},
	});
	win2.webContents.openDevTools();
	win2.loadFile('index.html', { query: { id: 2 } });
});
