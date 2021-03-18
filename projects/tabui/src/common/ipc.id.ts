import type { MenuItemConstructorOptions } from 'electron';

export const DND_TYPE_ID_BASE = 'tabui-drag-tab';

export enum IPCID {
	GetApplicationId = 'get.app.id',
	GetNextTabGuid = 'get.tab.guid',
	PanelMenu = 'show.panel.menu',
	TabMenu = 'show.tab.menu',
}

export interface IPanelMenuRequest {
	id: string;
	x: number;
	y: number;
}
export interface ITabMenuRequest {
	guid: number;
	menu: MenuItemConstructorOptions[];
	x: number;
	y: number;
}
