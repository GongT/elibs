import { linux_case_hyphen } from '@idlebox/common';

export function DOMSetAttribute(dom: HTMLElement, qualifiedName: string, value: string | null) {
	if (value === null) {
		dom.removeAttribute(qualifiedName);
	} else {
		dom.setAttribute(qualifiedName, value);
	}
}

export function DOMSetBooleanAttribute(dom: HTMLElement, qualifiedName: string, value: boolean) {
	if (value) {
		dom.setAttribute(qualifiedName, '');
	} else {
		dom.removeAttribute(qualifiedName);
	}
}

export function getCustomProperties<T>(instance: T): keyof T {
	return Reflect.getMetadata(getterSetterMetaKey, instance);
}

type FullGetSet<T> = Required<Pick<IGetterSetter<any, T>, 'get' | 'set'>>;
interface WithDefaultCreator<T> {
	(defVal: T): Required<IGetterSetter<any, T>>;
}
function withDefault<T>(input: FullGetSet<T>): FullGetSet<T> & WithDefaultCreator<T> {
	return Object.assign((defVal: T) => {
		return {
			...input,
			init() {
				return input.set(defVal);
			},
		};
	}, input);
}

const intHandler = {
	get(value: string | null): number {
		return parseInt(value || '0') || 0;
	},
	set(value: number) {
		return value.toFixed(0);
	},
};
const booleanHandler = {
	get(value: string | null) {
		if (value === null) return false;
		value = value.toLowerCase();
		if (value === 'yes' || value === 'true' || value === '') {
			return true;
		} else if (value === 'no' || value === 'false') {
			return false;
		} else {
			console.warn('Invalid boolean value: %s', value);
			return false;
		}
	},
	set(value: boolean) {
		return value ? '' : null;
	},
};
const stringHandler = {
	get(value: string | null) {
		return value || '';
	},
	set(value: string) {
		return value || null;
	},
};

export namespace DOMGetterSetter {
	export const interger = withDefault(intHandler);
	export const boolean = withDefault(booleanHandler);
	export const string = withDefault(stringHandler);

	export function enumerate<K extends string>(list: Record<K, string>, defaultValue: K) {
		return {
			get(value: K | null): string {
				return list[value || defaultValue];
			},
			set(value: K) {
				if (list[value]) {
					return list[value];
				} else {
					console.warn('Invalid enum value: %s', value);
					return null;
				}
			},
			init() {
				return list[defaultValue];
			},
		};
	}
}

interface IGetterSetter<TSelf, TType> {
	get?(this: TSelf, value: string | null): TType;
	set?(value: TType): string | null;
	init?(): string | null;
}

export const getterSetterMetaKey = 'gettersetter';
export const defauleValueMetaKey = 'propertyDefault';

export function GetterSetter<ELE extends HTMLElement, T>({ get, set, init }: IGetterSetter<ELE, T> = {}) {
	return (target: ELE, propertyKey: string | symbol) => {
		if (typeof propertyKey === 'symbol') {
			throw new Error('can not decorate symbol key');
		}

		const attributeName = linux_case_hyphen(propertyKey);

		if (!Reflect.hasMetadata(getterSetterMetaKey, target)) {
			Reflect.defineMetadata(getterSetterMetaKey, [], target);
		}
		const keys = Reflect.getMetadata(getterSetterMetaKey, target) as string[];
		keys.push(attributeName);

		if (init) {
			if (!Reflect.hasMetadata(defauleValueMetaKey, target)) {
				Reflect.defineMetadata(defauleValueMetaKey, {}, target);
			}
			const values = Reflect.getMetadata(defauleValueMetaKey, target) as Record<string, Function>;
			values[attributeName] = init;
		}

		Object.defineProperty(target, propertyKey, {
			get: function (this: ELE): T {
				const attr = this.getAttribute(attributeName);
				if (get) {
					return get.call(this, attr);
				} else {
					return attr as any;
				}
			},
			set: function (this: ELE, value: T) {
				let strValue: string | null;
				if (set) {
					strValue = set.call(this, value);
				} else if (typeof value === 'string' || value === null) {
					strValue = value as any;
				} else {
					throw new Error(`can not set ${this.constructor.name}.${propertyKey} to typeof ${typeof value}`);
				}
				DOMSetAttribute(this, attributeName, strValue);
			},
			enumerable: true,
			configurable: false,
		});
	};
}
