const { contextBridge } = require('electron');
const { builtinModules } = require('module');

Object.keys(require.cache).forEach(function (key) {
	if (key === 'electron' || key.startsWith('electron/')) {
		return;
	}
	if (builtinModules.includes(key)) {
		return;
	}
	delete require.cache[key];
});
