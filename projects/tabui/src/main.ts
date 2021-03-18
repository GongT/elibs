import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { IPanelMenuRequest, IPCID, ITabMenuRequest } from './common/ipc.id';

const randomId = 'electron-app-tabui-id-' + (Math.random() * 100000).toFixed(0);
let guid = 1;

export function initTabUIMainProcess() {
	if (BrowserWindow.getAllWindows().length > 0) {
		throw new Error('must call initTabUIMainProcess() before create first window.');
	}
	mainHandle(IPCID.GetApplicationId, () => randomId);
	mainHandle(IPCID.GetNextTabGuid, () => guid++);
	mainHandle(IPCID.PanelMenu, handlePanelMenu);
	mainHandle(IPCID.TabMenu, handleTabMenu);
}

function mainHandle(action: string, callback: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<void> | any) {
	ipcMain.handle('tabui:' + action, callback);
}

function handleTabMenu(e: IpcMainInvokeEvent, arg: ITabMenuRequest) {
	console.log('handleTabMenu(%s, %j)', e.sender.id, arg);
}
function handlePanelMenu(e: IpcMainInvokeEvent, arg: IPanelMenuRequest) {
	console.log('handlePanelMenu(%s, %j)', e.sender.id, arg);
}
