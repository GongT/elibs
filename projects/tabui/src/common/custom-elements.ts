import { linux_case_hyphen } from '@idlebox/common';
import { __callLifecycleCallbacks, disposeLifecycle, registerLifecycle } from './custom-lifecycle';
import { defauleValueMetaKey, DOMSetAttribute, getterSetterMetaKey } from './dom-getset';
import { definePublicConstant } from './helper';

const firstMountSymbol = Symbol('custom-element-first-connect');
const initStateSymbol = Symbol.for('@tabui/init');

export function isFirstMount(ele: HTMLElement) {
	return (ele as any)[firstMountSymbol] === undefined;
}

export function DefineCustomElements(options?: ElementDefinitionOptions) {
	return function DefineCustomElementsDecorator(elementConstructor: typeof HTMLElement) {
		const anyCtor = elementConstructor as any;
		const proto = elementConstructor.prototype;
		const anyProto = proto as any;
		const name = linux_case_hyphen(elementConstructor.name);
		// console.log('define:%s', name, options);

		///[*] changing native behavior
		if (anyProto.attributeChangedCallback) {
			const orignal = anyProto.attributeChangedCallback;
			anyProto.attributeChangedCallback = function wrappedAttributeChangedCallback(
				name: string,
				ov: any,
				nv: any
			) {
				// console.log('[%s] %s : %s{%s} => %s{%s}', elementConstructor.name, name, ov, typeof ov, nv, typeof nv);
				if (ov !== nv) {
					orignal.call(this, name, ov, nv);
				}
			};
		}

		///[*] CustomKeys - from dom-getset
		const customValueKeys: string[] | undefined = Reflect.getMetadata(getterSetterMetaKey, proto);
		const originalCustomValueKeys = anyCtor.observedAttributes || [];
		Object.defineProperty(elementConstructor, 'observedAttributes', {
			configurable: false,
			enumerable: true,
			writable: false,
			value: originalCustomValueKeys.concat(customValueKeys || []),
		});
		// console.log(anyCtor.observedAttributes);

		///[*] CustomKeys (default value) - from dom-getset
		const customValueDefaults: Record<string, Function> | undefined = Reflect.getMetadata(
			defauleValueMetaKey,
			proto
		);
		if (customValueKeys && (customValueDefaults || anyProto.attributeChangedCallback)) {
			registerLifecycle(proto, function (this: HTMLElement) {
				if (!isFirstMount(this)) return;

				for (const key of customValueKeys) {
					if (!this.hasAttribute(key)) {
						if (customValueDefaults && customValueDefaults[key]) {
							DOMSetAttribute(this, key, customValueDefaults[key].call(this));
						} else if ((this as any).attributeChangedCallback) {
							(this as any).attributeChangedCallback.call(this, key, initStateSymbol, null);
						}
					}
				}
			});
		}

		///[*] Connect Callback - from custom-lifecycle
		const originalConnectedCallback: () => undefined = anyProto.connectedCallback;
		if (originalConnectedCallback) {
			registerLifecycle(proto, originalConnectedCallback);
			delete anyProto.connectedCallback;
		}
		definePublicConstant(proto, 'connectedCallback', function connectedCallback(this: HTMLElement) {
			const anyThis = this as any;
			if (!this.isConnected) {
				anyThis.disconnectedCallback();
				return;
			}

			__callLifecycleCallbacks(this);

			anyThis[firstMountSymbol] = false;
		});

		///[*] Disconnect Callback - from custom-lifecycle
		const originalDisconnectedCallback: Function = (proto as any).disconnectedCallback;
		definePublicConstant(proto, 'disconnectedCallback', function disconnectedCallback(this: HTMLElement) {
			if (originalDisconnectedCallback) originalDisconnectedCallback.call(this);
			disposeLifecycle(this);
		});

		///[*] Final register to window - must last line
		customElements.define(name, elementConstructor, options);
	};
}
