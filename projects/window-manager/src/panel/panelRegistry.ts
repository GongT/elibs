import { EventRegister, IDisposable } from '@idlebox/common';
import { SimpleTypes } from '../global';
import { Panel } from './panel';

export interface IPanelConstructor {
	new (param: SimpleTypes): IPanel;
	readonly name: string;
}

export interface IPanelData {
	panelName: string;
	title: string;
	entryFile: string;
	styleFile: string;
}

export interface IPanel extends IDisposable {
	onTitleChange: EventRegister<string>;

	onBeforeShow(): Promise<void>;
	onAfterHide(): Promise<void>;

	entryFile: string;
	styleFile?: string;
}

const panelRegistry = new Map<string, IPanelConstructor>();
const instanceMap = new Map<string, Map<SimpleTypes, Panel>>();

export function registerPanel(panelCtor: IPanelConstructor) {
	if (!panelCtor.name) {
		throw new Error('can not register panel without name');
	}
	if (panelRegistry.has(panelCtor.name)) {
		throw new Error('duplicate register panel: ' + panelCtor.name);
	}
	panelRegistry.set(panelCtor.name, panelCtor);
}

export function instancePanel(panelNameOrCtor: IPanelConstructor | string, param: SimpleTypes): Panel {
	let Ctor: IPanelConstructor;
	if (typeof panelNameOrCtor === 'string') {
		if (!panelRegistry.has(panelNameOrCtor)) {
			throw new Error('missing panel with name: ' + panelNameOrCtor);
		}
		Ctor = panelRegistry.get(panelNameOrCtor)!;
	} else {
		Ctor = panelNameOrCtor;
	}

	if (instanceMap.get(Ctor.name)?.has(param)) {
		return instanceMap.get(Ctor.name)!.get(param)!;
	}

	const ins = new Panel(new Ctor(param));

	if (!instanceMap.has(Ctor.name)) {
		instanceMap.set(Ctor.name, new Map());
	}

	instanceMap.get(Ctor.name)!.set(param, ins);

	return ins;
}
