import { ipcRenderer } from 'electron';
import { IPCID } from './ipc.id';

export function rendererInvoke(action: IPCID, ...param: any[]): Promise<any> {
	return ipcRenderer.invoke('tabui:' + action, ...param);
}
