import { AsyncDisposable } from '@idlebox/common';
import { ElectronIPCMain, StateMaster } from '@idlebox/state';
import { BrowserWindow } from 'electron';
import { tmpdir } from 'node:os';
import { isDevelopment } from '../helpers/dev';
import { Panel } from '../panel/panel';

export class Window extends AsyncDisposable {
	private readonly browser: BrowserWindow;

	constructor(public readonly id: number, private readonly state: StateMaster) {
		super();

		this.browser = new BrowserWindow({
			webPreferences: {
				nodeIntegration: true,
				preload: require.resolve('../renderer/main'),
			},
		});
		this.browser.loadURL('about:blank', {});
		if (isDevelopment()) {
			this.browser.webContents.openDevTools({ mode: 'right', activate: false });
		}

		const driver = new ElectronIPCMain('window-manager-state:' + id, this.browser);
		state.attach(driver);
		this._register(driver);

		state.on('window-total-close', () => {
			this.dispose();
		});
	}
}
