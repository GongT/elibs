import { IDisposable } from '@idlebox/common';
import { DefineCustomElements } from '../common/custom-elements';
import { GetterSetter, DOMGetterSetter } from '../common/dom-getset';

interface IRenderFunction {
	(root: ShadowRoot): IDisposable;
}

@DefineCustomElements()
export class TabView extends HTMLElement {
	private firstRender: boolean = true;
	private disposeRender?: IDisposable;
	public render?: IRenderFunction;

	constructor() {
		super();
	}

	private _render() {
		const shadowRoot = this.attachShadow({ mode: 'closed' });
		for (let n = 0; n < this.childNodes.length; n++) {
			shadowRoot.appendChild(this.childNodes.item(n));
		}
		this.disposeRender = this.render?.(shadowRoot);
	}

	dispose() {
		if (this.disposeRender) this.disposeRender.dispose();
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, newValue);
		if (name === 'open') {
			const bValue = DOMGetterSetter.boolean.get(newValue);
			if (bValue) {
				if (this.firstRender) {
					this.firstRender = false;
					this._render();
				}
			}
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	@GetterSetter(DOMGetterSetter.boolean(false)) public declare open: boolean;
}
