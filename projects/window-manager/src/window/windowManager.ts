import { stringify } from 'querystring';
import { createMaster, StateMaster } from '@idlebox/state';
import { BrowserWindow } from 'electron';
import { SerializableTypes } from '../global';
import { isDevelopment } from '../helpers/dev';
import { Window } from './window';
import { createElectronWindow } from './create';

export class WindowManager {
	private windows: Record<number, BrowserWindow>;
	private state: StateMaster;

	constructor() {
		this.windows = {
			0: createElectronWindow({}),
		};

		this.state = createMaster({ development: isDevelopment() });
		this.state.state.watch([''], this.onPanelSwitch);
		this.state.on(eventName, callback);
	}

	createWindow() {
		const win = createElectronWindow({});
		this.windows[win.id] = win;
	}

	closeWindow(id: number) {}

	showPanel(name: string) {}
}
