import { EventRegister, IDisposable } from '@idlebox/common';

export interface IMainRenderFunction {
	(tabId: number, dom: ShadowRoot, options: ITabHeaderConfig, dataset: Readonly<DOMStringMap>): IDisposable;
}

export interface ISize {
	width: number;
	height: number;
}

export type IIcon = { iconClass: string } | { iconUrl: string };

export interface ICommunicateObject {
	readonly rootElement: HTMLElement;
	readonly tabId: number;
	readonly dataset: Record<string, string>;
	onBeforeDispose: EventRegister<void>;
	dispose(): void;
	setTitle(title: string): void;
	setIcon(icon: IIcon): void;
	setSize(icon: ISize): void;
	// TODO: menu
}

export interface ITabHeaderConfig {
	title?: string;
	iconClass?: string;
	iconUrl?: string;
	closable?: boolean;
	detachable?: boolean;
	movable?: boolean;
}
export interface ITabBodyConfig {
	renderFile: string;
	styleFile?: string;
	dataset?: Record<string, string>;
}

export interface ITabConfig extends ITabHeaderConfig, ITabBodyConfig {}

export interface ITabConfigExchange extends ITabConfig {
	tabId: number;
}

export enum ViewDirection {
	left = 'left',
	right = 'right',
	top = 'top',
	bottom = 'bottom',
}
