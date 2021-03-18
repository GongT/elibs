import { linux_case_hyphen } from '@idlebox/common';

export {};

console.log('Hello world');

class TestCustomTag extends HTMLElement {
	constructor() {
		super(); // always call super() first in the constructor.

		// Attach a shadow root to <fancy-tabs>.
		const shadowRoot = this.attachShadow({ mode: 'closed' });
		while (this.childNodes.length > 0) {
			shadowRoot.appendChild(this.childNodes[0]);
		}
		const btn = document.createElement('button');
		shadowRoot.appendChild(btn);
		btn.innerHTML = '!!!!!!!!!!!!!!!!!!!';
		btn.addEventListener('click', () => console.log('Hello, Button'));
	}
}

document.addEventListener('DOMContentLoaded', function () {
	const name = linux_case_hyphen('TestCustomTag');
	customElements.define(name, TestCustomTag);

	document.body.innerHTML = `<${name}><h1>Hello</h1> test</${name}><div>other</div>`;
});
