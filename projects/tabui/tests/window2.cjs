'use strict';
const render = require('path').resolve(__dirname, 'render.cjs');
const { loadStyle, TabContainer } = require('@gongt/tabui');

loadStyle();

const tabE = new TabContainer();
document.getElementById('tabE').append(tabE);

const tab1 = new TabContainer();
for (let i = 0; i < 20; i++) {
	tab1.addTab({
		title: 'Tab ' + i,
		render,
	});
}
document.getElementById('tab1').append(tab1);
