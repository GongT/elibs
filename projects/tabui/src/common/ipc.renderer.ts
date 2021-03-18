import { ipcRenderer } from 'electron';
import { DND_TYPE_ID_BASE, IPCID } from './ipc.id';

export function rendererInvoke(action: IPCID, ...param: any[]): Promise<any> {
	return ipcRenderer.invoke('tabui:' + action, ...param);
}

export let DND_TYPE_ID = DND_TYPE_ID_BASE;

rendererInvoke(IPCID.GetApplicationId).then((v) => {
	DND_TYPE_ID += ':' + v;
});
