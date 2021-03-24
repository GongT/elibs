exports.render = function render(tid, dom, opts, dataset) {
	console.log('render call: [%s] %o %o %o', tid, dom, opts, dataset);
	const h1 = document.createElement('h1');
	h1.innerText = `tab id: ${tid.toString()} (${opts.title})`;
	dom.append(h1);
	return {
		dispose() {
			dom.removeChild(h1);
			console.log('view disposed');
		}
	};
};
