import { IDisposable } from '@idlebox/common';

export interface IMainRenderFunction {
	(tabId: number, dom: ShadowRoot, options: ITabHeaderConfig, dataset: Readonly<DOMStringMap>): IDisposable;
}

export interface ITabHeaderConfig {
	title?: string;
	iconClass?: string;
	iconUrl?: string;
	closable?: boolean;
	detachable?: boolean;
	movable?: boolean;
}

export interface ITabConfig extends ITabHeaderConfig {
	render: string | IMainRenderFunction;
}

export function serializeRenderFunction(render: ITabConfig['render']): string {
	if (typeof render === 'function') {
		return 'function://' + render.toString();
	} else {
		return render;
	}
}

export enum ViewDirection {
	left = 'left',
	right = 'right',
	top = 'top',
	bottom = 'bottom',
}
