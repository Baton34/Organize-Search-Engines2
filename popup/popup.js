//import Tree2 from "/js/tree.js";
(async function () {
	function onError(error) {
		console.error(`OSE2 Error: ${error}`);
	};
	function getTreeCb(message) {
		tree.fillIn(message);
	};
	function recurse (rootChild,menuItems) {
		if (rootChild.name==='OSE2') {
			return;
		};
		const menuItem=document.createElement('li');
		menuItem.dataset.id= rootChild.name;
		const icon=document.createElement('span');
		icon.setAttribute('class','icon');
				if (rootChild.type == 1) {
			const image=document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			image.setAttribute('viewBox','0 0 16 16');
			image.setAttribute('width','16');
			image.setAttribute('height','16');
			const iconPath = document.createElementNS('http://www.w3.org/2000/svg','path');
			iconPath.setAttribute(
				'd',
				'm13.995 14-10.99 0A2.007 2.007 0 0 1 1 11.995l0-8.99C1 1.899 1.899 1 3.005 1l2.958 0a2.01 2.01 0 0 1 1.47.641L8.693 3l5.302 0C15.101 3 16 3.899 16 5.005l0 6.99A2.007 2.007 0 0 1 13.995 14zM2.85 2.25l-.6.6 0 9.3.6.6 11.3 0 .6-.6 0-7.3-.6-.6-5.73 0-.458-.2-1.445-1.559a.758.758 0 0 0-.554-.241l-3.113 0z'
			);
			image.appendChild(iconPath);
			icon.appendChild(image);
		}
		else {
			const image=document.createElement('img');
			image.setAttribute('src',rootChild.icon);
			icon.appendChild(image);
		}
		menuItem.appendChild(icon);
		const text=document.createElement('span');
		text.setAttribute('class','text');
		text.textContent=rootChild.name;
		menuItem.appendChild(text);
		if (rootChild.type == 1) { // folder
			menuItem.setAttribute('class', 'sfitem');
			const ul=document.createElement('ul');
			ul.setAttribute('class','nested');
			for (let child of rootChild.children) {
				recurse(child, ul);
			}
			menuItem.appendChild(ul);
		}
		else if (rootChild.type == 0) { // engine
			menuItem.setAttribute('class', 'spitem');
		}
		menuItems.appendChild(menuItem);
	};
	
	const renderList = async function () { 
		// render list
		const menu = document.getElementById('engineList');
		const menuItems = document.createDocumentFragment();
		for (let child of tree._root.children) {
			recurse(child,menuItems);
		};
		menu.innerHTML = '';
		menu.appendChild(menuItems);
		await addEventsToList();
	};
	const addEventsToList=async function() {
		// dblClick to open folder
		let toggler = document.getElementsByClassName("sfitem");
		for (let i = 0; i < toggler.length; i++) {
			toggler[i].addEventListener("click", function(e) {
				e.stopPropagation();
				this.querySelector(".nested").classList.toggle("active");
				//event.preventDefault();
			});
		};
		let toggler2 = document.getElementsByClassName("spitem");
		for (let i = 0; i < toggler2.length; i++) {
			toggler2[i].addEventListener("click", function(e) {
				e.stopPropagation();
				let target=e.target;
				if (!e.target.dataset.id) {
					target=e.target.parentElement;
				}
				const id=target.dataset.id;
				const icon=target.querySelector('.icon img').src;
				browser.runtime.sendMessage({setDefault: id, favIconUrl: icon}).then(()=> {
					window.close();
				});
			});
		};
	};
	document.addEventListener('contextmenu', event => {
	    // block contextmenu
		event.preventDefault();
	});
// ----------------------------------------------------------
	console.log('------ start popup ------');
	let tree=new Tree('0');
	await browser.runtime.sendMessage({getTree: true}).then(getTreeCb,onError);
	await renderList();
	console.log('------ popup started ------');
}());
