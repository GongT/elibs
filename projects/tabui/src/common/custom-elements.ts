import { Disposable, linux_case_hyphen } from '@idlebox/common';
import { domEventInitMetaKey } from './dom-event';
import { defauleValueMetaKey, DOMSetAttribute, getterSetterMetaKey } from './dom-getset';

const firstMountSymbol = Symbol('custom-element-first-connect');
const initStateSymbol = Symbol.for('@tabui/init');

export function DefineCustomElements(options?: ElementDefinitionOptions) {
	return function <T extends typeof HTMLElement>(elementConstructor: T) {
		const anyCtor = elementConstructor as any;
		const proto = elementConstructor.prototype;
		const anyProto = proto as any;
		const name = linux_case_hyphen(elementConstructor.name);
		// console.log('define:%s', name, options);

		const customValueKeys: string[] | undefined = Reflect.getMetadata(getterSetterMetaKey, proto);
		const originalCustomValueKeys = anyCtor.observedAttributes || [];
		Object.defineProperty(elementConstructor, 'observedAttributes', {
			configurable: false,
			enumerable: true,
			writable: false,
			value: originalCustomValueKeys.concat(customValueKeys || []),
		});
		// console.log((elementConstructor as any).observedAttributes);

		if (anyProto.attributeChangedCallback) {
			const orignal = anyProto.attributeChangedCallback;
			anyProto.attributeChangedCallback = function wrappedAttributeChangedCallback(
				name: string,
				oldVal: any,
				newVal: any
			) {
				// console.log(
				// 	'[%s] %s : %s{%s} => %s{%s}',
				// 	elementConstructor.name,
				// 	name,
				// 	oldVal,
				// 	typeof oldVal,
				// 	newVal,
				// 	typeof newVal
				// );
				if (oldVal !== newVal) {
					orignal.call(this, name, oldVal, newVal);
				}
			};
		}

		const customValueDefaults: Record<string, Function> | undefined = Reflect.getMetadata(
			defauleValueMetaKey,
			proto
		);

		const eventCallbacks = Reflect.getMetadata(domEventInitMetaKey, proto) as Function[];
		const domEventDisposableSymbol = Symbol.for('domEventDisposable');

		const originalConnectedCallback: Function = (proto as any).connectedCallback;
		delete (proto as any).connectedCallback;
		Object.defineProperty(proto, 'connectedCallback', {
			configurable: false,
			enumerable: true,
			writable: false,
			value: function disconnectedCallback(this: InstanceType<T>) {
				const anyThis = this as any;
				if (!this.isConnected) {
					anyThis.disconnectedCallback();
					return;
				}
				if (originalConnectedCallback) originalConnectedCallback.call(this);

				if (eventCallbacks && eventCallbacks.length) {
					if (anyThis[domEventDisposableSymbol]) {
						anyThis[domEventDisposableSymbol].dispose();
					}
					anyThis[domEventDisposableSymbol] = new Disposable();
					for (const cb of eventCallbacks) {
						anyThis[domEventDisposableSymbol]._register(cb.call(this));
					}
				}

				if (
					anyThis[firstMountSymbol] === undefined &&
					customValueKeys &&
					(customValueDefaults || anyThis.attributeChangedCallback)
				) {
					for (const key of customValueKeys) {
						if (!this.hasAttribute(key)) {
							if (customValueDefaults && customValueDefaults[key]) {
								DOMSetAttribute(this, key, customValueDefaults[key]());
							} else if (anyThis.attributeChangedCallback) {
								anyThis.attributeChangedCallback.call(this, key, initStateSymbol, null);
							}
						}
					}
				}

				anyThis[firstMountSymbol] = false;
			},
		});

		const originalDisconnectedCallback: Function = (proto as any).disconnectedCallback;
		delete (proto as any).disconnectedCallback;
		Object.defineProperty(proto, 'disconnectedCallback', {
			configurable: false,
			enumerable: true,
			writable: false,
			value: function disconnectedCallback() {
				if (originalDisconnectedCallback) originalDisconnectedCallback.call(this);

				if ((this as any)[domEventDisposableSymbol]) {
					(this as any)[domEventDisposableSymbol].dispose();
					(this as any)[domEventDisposableSymbol] = undefined;
				}
			},
		});

		// must last line
		customElements.define(name, elementConstructor, options);
	};
}
