import { Disposable, IDisposable } from '@idlebox/common';
import { isFirstMount } from './custom-elements';

const customElementInitCallbacksAtPrototype = Symbol('eventDisposable');
const domDisposableSymbol = Symbol.for('domDisposable');

/**
 * 修饰方法，挂载时执行，返回IDisposable，取消挂载时销毁
 * @public
 */
export function DOMOnAttach(singleTime = false) {
	return function DOMOnAttachDecorator(target: HTMLElement, propKey: string) {
		registerLifecycle(target, function DOMOnAttachHandler(this: any, ...args: any[]) {
			if (singleTime && !isFirstMount(this)) {
				return undefined;
			}
			return this[propKey](...args);
		});
	};
}

/**
 * 把静态取消挂载过程注册到CustomElement的prototype上
 * @public
 */
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

/** @internal */
export function disposeLifecycle(target: HTMLElement): void;
/** @internal */
export function disposeLifecycle(target: any) {
	if (target[domDisposableSymbol]) {
		target[domDisposableSymbol].dispose();
		delete target[domDisposableSymbol];
	}
}

/**
 * 把动态取消挂载过程注册到CustomElement对象上
 * @public
 */
export function disposeOnDomDetach(target: HTMLElement, d: IDisposable): void;
/** @public */
export function disposeOnDomDetach(target: any, d: IDisposable) {
	if (!target[domDisposableSymbol]) {
		target[domDisposableSymbol] = new Disposable();
	}
	target[domDisposableSymbol]._register(d);
}
