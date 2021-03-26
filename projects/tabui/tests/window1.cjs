'use strict';
const renderFile = require('path').resolve(__dirname, 'render.cjs');
const { loadStyle, TabContainer } = require('@gongt/tabui');

loadStyle();

test(1, 'bottom');
test(2, 'left');
test(3, 'right');
test(4, 'top');

const tabE = new TabContainer();
document.getElementById('tabE').append(tabE);

const tabN = new TabContainer();
for (let i = 0; i < 20; i++) {
	tabN.addTab({
		title: 'Tab ' + i,
		renderFile,
		dataset: { n: i },
	});
}
document.getElementById('tabN1').append(tabN);

const tabN2 = new TabContainer();
tabN2.direction = 'right';
for (let i = 0; i < 20; i++) {
	tabN2.addTab({
		title: 'Tab ' + i,
		renderFile,
		dataset: { n: i },
	});
}
document.getElementById('tabN2').append(tabN2);

function test(num, dir) {
	const tab = new TabContainer();
	let i = 0;
	tab.direction = dir;
	tab.addTab({
		title: 'First Tab',
		renderFile,
		dataset: { n: ++i },
	});
	tab.addTab({
		title: 'Unmovable',
		movable: false,
		renderFile,
		dataset: { n: ++i },
	});
	tab.addTab({
		title: 'Undetachable',
		detachable: false,
		renderFile,
		dataset: { n: ++i },
	});
	tab.addTab({
		iconClass: 'testImage',
		renderFile,
		dataset: { n: ++i },
	});
	tab.addTab({
		title: 'Pinned',
		closable: false,
		renderFile,
		dataset: { n: ++i },
	});
	document.getElementById('tab' + num).append(tab);
}
