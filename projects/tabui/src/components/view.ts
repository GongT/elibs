import { DefineCustomElements } from '../common/custom-elements';
import { DOMEventTrigger } from '../common/dom-event-trigger';
import { DOMGetterSetter, GetterSetter } from '../common/dom-getset';

export interface IRenderEventData {
	root: ShadowRoot;
}

@DefineCustomElements()
export class TabView extends HTMLElement {
	private _shadowRoot?: ShadowRoot;
	private renderState = false;

	constructor() {
		super();
	}

	private _render() {
		this._removeRender();

		if (!this._shadowRoot) this._shadowRoot = this.attachShadow({ mode: 'closed' });

		this._shadowRoot.innerHTML = '';
		const notCaptured = this.renderEvent({ root: this._shadowRoot });

		if (notCaptured) {
			console.warn('tab view not rendered', this);
			if (this._shadowRoot.innerHTML) {
				throw new Error('render has done, but event.preventDefault() is not called.');
			}
			this._removeRender();
		}
		this.renderState = !notCaptured;
	}

	disconnectedCallback() {
		this._removeRender();
	}

	removeRender() {
		this._removeRender();
		this.removeAttribute('open');
	}

	private _removeRender() {
		if (this.renderState) {
			this.disposeEvent();
			if (this._shadowRoot!.innerHTML) {
				console.warn('not cleanup after dispose');
			}
		}
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, newValue);
		if (name === 'open') {
			const bValue = DOMGetterSetter.boolean.get(newValue);
			if (bValue) {
				if (!this._shadowRoot) this._render();
			}
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	@GetterSetter(DOMGetterSetter.boolean(false)) public declare open: boolean;
	@DOMEventTrigger({ eventName: 'render', bubbles: true, cancelable: true })
	private declare renderEvent: DOMEventTrigger<IRenderEventData>;
	@DOMEventTrigger({ eventName: 'dispose', bubbles: true, cancelable: true })
	private declare disposeEvent: DOMEventTrigger<void>;
}
