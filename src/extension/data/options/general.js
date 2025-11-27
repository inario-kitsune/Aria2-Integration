
'use strict';
function save() {
	const zoom = document.getElementById('zoom').value;
	const menu = document.getElementById('cm').checked;
	const chgLog = document.getElementById('chgLog').checked;
	const badge = document.getElementById('badge').checked;
	const downPanel = document.getElementById('downPanel').checked;
	const cmDownPanel = document.getElementById('cmDownPanel').checked;
	const dpHeight = document.getElementById('dpHeight').value;
	const dpWidth = document.getElementById('dpWidth').value;

	browser.storage.local.set({
		zoom,
		menu,
		ua: true, // Always send User-Agent
		chgLog,
		badge,
		downPanel,
		cmDownPanel,
		dpHeight,
		dpWidth
	}, () => {
		const status = document.getElementById('status');
		status.textContent = browser.i18n.getMessage("OP_saveComplete");
		setTimeout(() => {
			status.textContent = '';
		}, 750);
		browser.runtime.sendMessage({
			get: "loadSettings",
		});
	});
}

function restore() {
	browser.storage.local.get(Object.assign(config.command.guess), prefs => {
		document.getElementById('zoom').value = prefs.zoom;
		document.getElementById('cm').checked = prefs.menu;
		document.getElementById('chgLog').checked = prefs.chgLog;
		document.getElementById('badge').checked = prefs.badge;
		document.getElementById('cmDownPanel').checked = prefs.cmDownPanel;
		document.getElementById('downPanel').checked = prefs.downPanel;
	});
	browser.storage.local.get(['dpWidth', 'dpHeight'], prefs => {
		document.getElementById('dpWidth').value = prefs.dpWidth;
		document.getElementById('dpHeight').value = prefs.dpHeight;
		document.getElementById('dpWidthN').value = prefs.dpWidth || 0;
		document.getElementById('dpHeightN').value = prefs.dpHeight || 0;
	});
	document.querySelectorAll('[data-message]').forEach(n => {
		n.textContent = browser.i18n.getMessage(n.dataset.message);
	});
	document.body.style = "direction: " + browser.i18n.getMessage("direction");
}

function dpHChange(e) {
	if (e.target.value > 5000)
		e.target.value = 5000;
	else if (e.target.value < -5000)
		e.target.value = -5000;
	else if (e.target.value == "")
		e.target.value = 0;
	document.getElementById('dpHeight').value = e.target.value;
	document.getElementById('dpHeightN').value = e.target.value;
}

function dpWChange(e) {
	if (e.target.value > 5000)
		e.target.value = 5000;
	else if (e.target.value < -5000)
		e.target.value = -5000;
	else if (e.target.value == "")
		e.target.value = 0;
	document.getElementById('dpWidth').value = e.target.value;
	document.getElementById('dpWidthN').value = e.target.value;
}

document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);
document.getElementById('dpHeight').onchange = dpHChange;
document.getElementById('dpHeightN').onchange = dpHChange;
document.getElementById('dpWidth').onchange = dpWChange;
document.getElementById('dpWidthN').onchange = dpWChange;