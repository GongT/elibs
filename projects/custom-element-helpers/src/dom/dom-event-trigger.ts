export interface DOMEventTrigger<T> {
	(e: T): boolean;
}
export interface ICustomEventInit extends EventInit {
	eventName?: string;
	targetProperty?: string;
	targetSelector?: string;
	target?: Window | HTMLElement;
}

export function DOMEventTrigger<T>(eventInit: ICustomEventInit = {}) {
	return function eventTrigger(self: HTMLElement, propKey: string) {
		const eName = eventInit.eventName || propKey;
		if (typeof (self as any)[propKey] !== 'undefined') {
			throw new Error('DOMEventTrigger property must be undefined (declare)');
		}

		const { bubbles, cancelable, composed, targetProperty, targetSelector, target: $target } = eventInit;

		Object.defineProperty(self, propKey, {
			configurable: false,
			enumerable: true,
			writable: false,
			value: function eventFire(this: HTMLElement, data: any) {
				let target: HTMLElement | Window;
				if ($target) {
					target = $target;
				} else if (targetProperty) {
					target = (this as any)[targetProperty];
				} else if (targetSelector) {
					target = this.querySelector(targetSelector) as HTMLElement;
				} else {
					target = this;
				}

				const ev = new CustomEvent(eName, { bubbles, cancelable, composed, detail: data });
				// console.log('fire event', ev);
				return target.dispatchEvent(ev);
			},
		});
	};
}
