import { resolve } from 'path';
import { app, BrowserWindow } from 'electron';

app.on('ready', () => {
	const win = new BrowserWindow({
		x: 100,
		width: 800,
		webPreferences: {
			contextIsolation: false,
			preload: resolve(__dirname, 'renderer/electron-renderer-main.js'),
		},
	});
	win.webContents.openDevTools({ mode: 'right' });
	win.loadURL('about:blank?test=1');
	console.log('create win = ', win.id);
});
