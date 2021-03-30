import { DefineCustomElements, domConvert, DOMEventTrigger, DOMGetSet } from '@gongt/custom-element-helpers';
import { definePublicConstant, Emitter, IDisposable } from '@idlebox/common';
import { ICommunicateObject, IIcon, ISize, ITabBodyConfig } from '../common/type';

export interface IRenderEventData {
	root: ShadowRoot;
}

class CommunicateObject implements ICommunicateObject {
	public readonly _onBeforeDispose = new Emitter<void>();
	public readonly onBeforeDispose = this._onBeforeDispose.register;
	public readonly rootElement: HTMLDivElement;
	public readonly shadowRoot: ShadowRoot;
	public declare readonly tabId: number;

	constructor(private readonly tab: TabView) {
		this.shadowRoot = tab.attachShadow({ mode: 'closed' });
		this.rootElement = document.createElement('div');
		this.shadowRoot.append(this.rootElement);
	}

	dispose() {
		this._onBeforeDispose.fire();
		this._onBeforeDispose.dispose();
		this.rootElement.innerHTML = '';
		this.shadowRoot.append(this.rootElement);
	}
	setTitle(title: string): void {
		this.tab.changeTitleEvent(title);
	}
	setIcon(icon: IIcon): void {
		this.tab.changeIconEvent(icon);
	}
	setSize(size: ISize): void {
		this.tab.changeSizeEvent(size);
	}
	public get dataset(): Record<string, string> {
		return this.tab.dataset as any;
	}
}

@DefineCustomElements()
export class TabView extends HTMLElement {
	private renderState?: IDisposable;
	private readonly communicateObject: CommunicateObject;

	constructor() {
		super();
		this.communicateObject = new CommunicateObject(this);
	}

	private _render() {
		if (this.renderState) return;
		if (!this.renderFile) throw new Error('no renderFile on view body');
		if (!this.tabId) throw new Error('no tabId on view body');

		definePublicConstant(this.communicateObject, 'tabId', this.tabId);

		const styleFile = this.styleFile;
		if (styleFile) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = styleFile;
			this.communicateObject.shadowRoot.append(link);
		}

		const module = require(this.renderFile);
		if (module?.render) {
			this.renderState = module.render(this.communicateObject);
		} else if (module?.default?.render) {
			this.renderState = module.default.render(this.communicateObject);
		} else {
			throw new Error('invalid render module: ' + this.renderFile);
		}
		if (!this.renderState?.dispose) {
			throw new Error('render function does not return disposable');
		}
	}

	disconnectedCallback() {
		if (this.renderState) {
			this.removeAttribute('open');
			this.renderState.dispose();
			delete this.renderState;

			this.communicateObject._onBeforeDispose.fire();
			this.communicateObject.dispose();
		}
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, newValue);
		if (name === 'open') {
			const bValue = domConvert.boolean.get(newValue);
			if (bValue && !this.renderState) {
				this._render();
			}
		} else if (name === 'render-file' || name === 'style-file' || name === 'tab-id') {
			if (this.renderState) throw new Error(`can not replace "${name}" after render already complete.`);
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	getState(): ITabBodyConfig {
		return {
			renderFile: this.renderFile,
			styleFile: this.styleFile || undefined,
			dataset: this.dataset as any,
		};
	}

	@DOMGetSet(domConvert.boolean(false)) public declare open: boolean;

	@DOMGetSet(domConvert.interger) public declare tabId: number;

	@DOMGetSet(domConvert.string) public declare renderFile: string;
	@DOMGetSet(domConvert.string) public declare styleFile: string;

	@DOMEventTrigger({ eventName: 'render', bubbles: true })
	public declare renderEvent: DOMEventTrigger<ICommunicateObject>;

	/** @internal */
	@DOMEventTrigger({ eventName: 'changeTitle', bubbles: true })
	public declare changeTitleEvent: DOMEventTrigger<string>;

	/** @internal */
	@DOMEventTrigger({ eventName: 'changeIcon', bubbles: true })
	public declare changeIconEvent: DOMEventTrigger<IIcon>;

	/** @internal */
	@DOMEventTrigger({ eventName: 'changeSize', bubbles: true })
	public declare changeSizeEvent: DOMEventTrigger<ISize>;
}
