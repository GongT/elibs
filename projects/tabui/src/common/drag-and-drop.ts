import { ApplicationId, DND_TYPE_ID } from './ipc.renderer';

import type { ITabConfig } from './type';

export interface IDndData {
	applicationId?: string;
	panelId?: string;
	tabs: ReadonlyArray<Readonly<Partial<ITabConfig> & { tabId: number }>>;
}

export enum DragSourceKind {
	single = 'single',
	multi = 'multi',
}

export function setDndData(dataTransfer: null | DataTransfer, data: IDndData, kind: DragSourceKind) {
	// console.log('[SET] %s=%s', DND_TYPE_ID, JSON.stringify({ ...data, applicationId: ApplicationId }));
	dataTransfer!.setData(DND_TYPE_ID, JSON.stringify({ ...data, kind, applicationId: ApplicationId }));
	dataTransfer!.setData(DND_TYPE_ID + ':' + DragSourceKind[kind], 'yes');
}

export function attachMoreDndData(dataTransfer: null | DataTransfer, moreData: Partial<IDndData>) {
	const input = parseDndData(dataTransfer);
	if (!input) return;
	const kind = getDndKind(dataTransfer);
	if (!kind) {
		throw new Error('no kind param');
	}
	setDndData(dataTransfer, Object.assign(input, moreData), kind);
}

export function hasDndData(dataTransfer: null | DataTransfer): boolean {
	if (!dataTransfer) return false;
	return dataTransfer.types.includes(DND_TYPE_ID);
}

export function getDndKind(dataTransfer: null | DataTransfer): DragSourceKind | undefined {
	if (dataTransfer?.types.includes(DND_TYPE_ID + ':single')) {
		return DragSourceKind.single;
	} else if (dataTransfer?.types.includes(DND_TYPE_ID + ':multi')) {
		return DragSourceKind.multi;
	} else {
		return undefined;
	}
}

export function parseDndData(dataTransfer: null | DataTransfer): IDndData | undefined {
	if (!dataTransfer) return undefined;
	const dataStr = dataTransfer.getData(DND_TYPE_ID);
	// console.log('[GET] %s=%s', DND_TYPE_ID, dataStr);
	if (!dataStr) return undefined;
	return JSON.parse(dataStr);
}

export function markPanelId(dataTransfer: null | DataTransfer, id: string | null) {
	if (!id) return;
	dataTransfer!.setData(DND_TYPE_ID + ':tabui-panel-id:' + id, 'yes');
}

export function checkPanelId(dataTransfer: null | DataTransfer, id: string | null) {
	if (!id) return false;
	return dataTransfer!.types.includes(DND_TYPE_ID + ':tabui-panel-id:' + id);
}
