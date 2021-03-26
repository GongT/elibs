'use strict';
const renderFile = require('path').resolve(__dirname, 'render.cjs');
const { loadStyle, TabContainer } = require('@gongt/tabui');

loadStyle();

const tabE = new TabContainer();
document.getElementById('tabE').append(tabE);

const tab1 = new TabContainer();
for (let i = 0; i < 20; i++) {
	tab1.addTab({
		title: 'Tab ' + i,
		renderFile,
	});
}
document.getElementById('tab1').append(tab1);

const tab4 = new TabContainer();
document.getElementById('tab4').append(tab4);
tab4.addTab({
	title: 'Timer',
	renderFile,
	dataset: { timer: true },
});
