import { addDisposableEventListener, registerGlobalLifecycle } from '@idlebox/common';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import type { TabSwitch } from '../components/switch';
import { DND_TYPE_ID_BASE, IPCID } from './ipc.id';

export function rendererInvoke(action: IPCID, ...param: any[]): Promise<any> {
	return ipcRenderer.invoke('tabui:' + action, ...param);
}

export let DND_TYPE_ID = DND_TYPE_ID_BASE;
export let ApplicationId: string;
export let WindowId: number;

rendererInvoke(IPCID.GetApplicationId).then(({ applicationId, windowId }) => {
	ApplicationId = applicationId;
	DND_TYPE_ID += ':' + applicationId;

	WindowId = windowId;
});

export function closeTabInOtherWindow(windowId: number, tabIds: number[]) {
	ipcRenderer.sendTo(windowId, 'tabui:' + IPCID.DestroyTabs, tabIds);
}

registerGlobalLifecycle(
	addDisposableEventListener(ipcRenderer, 'tabui:' + IPCID.DestroyTabs, (_e: IpcRendererEvent, tabIds: number[]) => {
		const selector = tabIds.map((tabId) => `tab-switch[tabid="${tabId}"]`).join(',');
		document.body.querySelectorAll<TabSwitch>(selector).forEach((element) => {
			element.remove();
		});
	})
);
