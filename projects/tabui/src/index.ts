/// <reference lib="dom" />
import 'reflect-metadata';

export class TabUI {
	constructor() {}
}

const styleId = 'tabui-style';
export function loadStyle() {
	if (document.getElementById('styleId')) {
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'file://' + __dirname + '/tabui-styles.css';
	link.id = styleId;
	document.head.append(link);
}
