import { DefineCustomElements } from '../common/custom-elements';
import { DOMEvent } from '../common/dom-event';
import { DOMGetterSetter, GetterSetter } from '../common/dom-getset';
import { __getTabId } from '../common/helper';
import { ITabConfig, ViewDirection } from '../common/type';
import { TabBody } from './body';
import { TabHeader } from './header';

@DefineCustomElements()
export class TabContainer extends HTMLElement {
	private readonly $header = new TabHeader();
	private readonly $body = new TabBody();

	constructor() {
		super();

		this.append(this.$header, this.$body);
	}

	async addTab(options: ITabConfig) {
		const $newTab = await this.$header.addTab(options);
		const newTabId = __getTabId($newTab);

		this.$body.addTab(newTabId, options);
	}

	@DOMEvent({ eventName: 'switch', targetProperty: '$header' })
	protected onTabSwitch({ detail }: CustomEvent) {
		// console.log('--------switch', detail);
		this.$body.show = detail!;
	}

	@DOMEvent({ eventName: 'close', targetProperty: '$header' })
	protected onTabClose({ detail }: CustomEvent) {
		// console.log('--------close', detail);
		this.$body.deleteTab(detail);
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, _newValue);
		if (name === 'collapse') {
		} else if (name === 'direction') {
			if (newValue) {
				this.$header.setAttribute('direction', newValue || 'bottom');
			} else {
				this.setAttribute('direction', 'bottom');
			}
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	@GetterSetter(DOMGetterSetter.boolean) public declare collapse: boolean;
	@GetterSetter(DOMGetterSetter.enumerate(ViewDirection, ViewDirection.bottom))
	public declare direction: ViewDirection;
}
