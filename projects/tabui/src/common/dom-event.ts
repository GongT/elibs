import { addDisposableEventListener } from '@idlebox/common';
import { registerLifecycle } from './custom-lifecycle';

interface IEventRegisterOptions {
	capture: boolean;
	once: boolean;
	passive: boolean;
	eventName: string;
	stopPropagation: boolean;
	preventDefault: boolean;
	targetProperty: string;
	targetSelector: string;
	target: Window | HTMLElement;
}

export function DOMEvent({
	eventName,
	preventDefault,
	stopPropagation,
	capture,
	once,
	passive,
	targetProperty,
	targetSelector,
	target: $target,
}: Partial<IEventRegisterOptions> = {}) {
	return function <T extends HTMLElement>(
		target: T,
		propertyKey: string
		// descriptor: TypedPropertyDescriptor<Function>
	) {
		if (!eventName) {
			eventName = propertyKey.toLowerCase();
		}

		registerLifecycle(target, function DOMEventHandler(this: T) {
			// console.log('register event callback [%s] <%O>', eventName, this);
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

			return addDisposableEventListener(target, eventName!, { capture, once, passive }, (e: Event) => {
				if (stopPropagation) {
					e.stopImmediatePropagation();
					e.preventDefault();
				} else if (preventDefault) {
					e.preventDefault();
				}

				return (this as any)[propertyKey].call(this, e);
			});
		});
	};
}
