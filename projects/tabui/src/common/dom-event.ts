import { addDisposableEventListener } from '@idlebox/common';

export const domEventInitMetaKey = Symbol('eventDisposable');

interface IEventRegisterOptions {
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
	targetProperty,
	targetSelector,
	target: $target,
}: Partial<IEventRegisterOptions> = {}) {
	return function <T extends HTMLElement>(
		target: T,
		propertyKey: string
		// descriptor: TypedPropertyDescriptor<Function>
	) {
		if (!Reflect.hasMetadata(domEventInitMetaKey, target)) {
			Reflect.defineMetadata(domEventInitMetaKey, [], target);
		}

		if (!eventName) {
			eventName = propertyKey.toLowerCase();
		}

		const callbacks: Function[] = Reflect.getMetadata(domEventInitMetaKey, target);
		callbacks.push(function eventRegister(this: T) {
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

			return addDisposableEventListener(target, eventName!, (e: Event) => {
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
