import { Disposable, IDisposable } from '@idlebox/common';
import { isFirstMount } from './custom-elements';

const customElementInitCallbacksAtPrototype = Symbol('eventDisposable');
const domDisposableSymbol = Symbol.for('domDisposable');

export function DOMInit(singleTime = false) {
	return function DOMInitDecorator(target: HTMLElement, propKey: string) {
		registerLifecycle(target, function DOMInitHandler(this: any, ...args: any[]) {
			if (singleTime && !isFirstMount(this)) {
				return undefined;
			}
			return this[propKey](...args);
		});
	};
}

export function registerLifecycle(targetPrototype: HTMLElement, callback: () => IDisposable | void) {
	if (!Reflect.hasMetadata(customElementInitCallbacksAtPrototype, targetPrototype)) {
		Reflect.defineMetadata(customElementInitCallbacksAtPrototype, [], targetPrototype);
	}
	const callbacks: Function[] = Reflect.getMetadata(customElementInitCallbacksAtPrototype, targetPrototype);
	callbacks.push(callback);
}

/** @internal */
export function callLifecycleCallbacks(target: HTMLElement): void;
/** @internal */
export function callLifecycleCallbacks(target: any) {
	const eventCallbacks = Reflect.getMetadata(
		customElementInitCallbacksAtPrototype,
		Object.getPrototypeOf(target)
	) as Function[];

	if (eventCallbacks && eventCallbacks.length) {
		if (target[domDisposableSymbol]) {
			target[domDisposableSymbol].dispose();
		}
		target[domDisposableSymbol] = new Disposable();

		for (const cb of eventCallbacks) {
			const d = cb.call(target);
			if (d) {
				target[domDisposableSymbol]._register(d);
			}
		}
	}
}

export function disposeLifecycle(target: HTMLElement): void;
export function disposeLifecycle(target: any) {
	if (target[domDisposableSymbol]) {
		target[domDisposableSymbol].dispose();
		delete target[domDisposableSymbol];
	}
}

export function disposeOnDetach(target: HTMLElement, d: IDisposable): void;
export function disposeOnDetach(target: any, d: IDisposable) {
	if (!target[domDisposableSymbol]) {
		target[domDisposableSymbol] = new Disposable();
	}
	target[domDisposableSymbol]._register(d);
}
