import { BrowserWindow } from 'electron';
import { stringify } from 'querystring';
import { SerializableTypes } from '../global';
import { isDevelopment } from '../helpers/dev';

export function createElectronWindow(args: Record<string, SerializableTypes>) {
	const window = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			preload: require.resolve('../renderer/electron-renderer-main'),
		},
	});
	args.id = window.id;
	window.loadURL('about:blank?' + stringify(args), {});
	if (isDevelopment()) {
		window.webContents.openDevTools({ mode: 'right', activate: false });
	}
	return window;
}
