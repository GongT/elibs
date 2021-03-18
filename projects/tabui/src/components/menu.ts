import { DefineCustomElements } from '../common/custom-elements';
import { DOMEvent } from '../common/dom-event';
import { IPanelMenuRequest, IPCID } from '../common/ipc.id';
import { rendererInvoke } from '../common/ipc.renderer';

@DefineCustomElements()
export class TabMenu extends HTMLElement {
	private $button = document.createElement('button') as HTMLButtonElement;

	constructor() {
		super();
		this.append(this.$button);
	}

	@DOMEvent({ stopPropagation: true, eventName: 'click', targetProperty: '$button' })
	onButtonClick({ x, y }: MouseEvent) {
		rendererInvoke(IPCID.PanelMenu, { id: this.id, x, y } as IPanelMenuRequest);
	}
}
