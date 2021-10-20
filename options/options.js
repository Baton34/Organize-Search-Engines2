//import Tree2 from "/js/tree.js";
(async function () {
	function onError(error) {
		console.error(`OSE2 Error: ${error}`);
	};
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	};
	function recurse (rootChild,menuItems) {
		if (rootChild.name==='OSE2') {
			return;
		};
		const menuItem=document.createElement('li');
		menuItem.dataset.id=rootChild.name;
		menuItem.setAttribute('draggable',true);
		const icon=document.createElement('span');
		icon.setAttribute('class','icon');
		if (rootChild.type == 1) {
			const image=document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			image.setAttribute('viewBox','0 0 16 16');
			image.setAttribute('width','20');
			image.setAttribute('height','20');
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
		let foldersNestedStates=[];
		let folders = document.getElementsByClassName("sfitem");
		for (let i = 0; i < folders.length; i++) {
			let state=folders[i].querySelector(".nested").classList.contains("active");
			foldersNestedStates.push({id: folders[i].dataset.id, nested: state});
		};
		const menu = document.getElementById('splist');
		const menuItems = document.createDocumentFragment();
		for (let child of tree._root.children) {
			recurse(child,menuItems);
		};
		menu.innerHTML = '';
		menu.appendChild(menuItems);
		
		folders = document.getElementsByClassName("sfitem");
		for (let i = 0; i < folders.length; i++) {
			const folderToNest=foldersNestedStates.find(function(folder){
				return folders[i].dataset.id===folder.id;
			});
			if (folderToNest && folderToNest.nested) {
				folders[i].querySelector(".nested").classList.add("active");
			};
		};
		await addEventsToList();
	};
	
	function getTreeCb(message) {
		tree.fillIn(message);
	};
	const addEventsToList=async function() {
		// dblClick to open folder
		let toggler = document.getElementsByClassName("sfitem");
		for (let i = 0; i < toggler.length; i++) {
			toggler[i].addEventListener("dblclick", function(e) {
				e.stopPropagation();
				this.querySelector(".nested").classList.toggle("active");
				//event.preventDefault();
			});
			toggler[i].addEventListener("dragstart", dragStart_handler);
			toggler[i].addEventListener("drop",drop_handler);
			toggler[i].addEventListener("dragover",dragOver_handler);
			toggler[i].addEventListener("dragenter",dragEnter_handler);
			toggler[i].addEventListener("dragleave",dragLeave_handler);
			toggler[i].addEventListener("dragend",dragEnd_handler);
		}
		let toggler2 = document.getElementsByClassName("spitem");
		for (let i = 0; i < toggler2.length; i++) {
			toggler2[i].addEventListener("dragstart", dragStart_handler);
			toggler2[i].addEventListener("drop",drop_handler);
			toggler2[i].addEventListener("dragover",dragOver_handler);
			toggler2[i].addEventListener("dragenter",dragEnter_handler);
			toggler2[i].addEventListener("dragleave",dragLeave_handler);
			toggler2[i].addEventListener("dragend",dragEnd_handler);
		}
		
	};
	function setCurrent(dateId) {
		if (dateId==null) {
			return;
		}
		if (current && current!==dateId) {
			const li=document.querySelector("[data-id='"+current+"']");
			if (li) {
				li.classList.remove("current");
			}
		};
		current=dateId;
		let item=document.querySelector("[data-id='"+dateId+"']");
		item.classList.add("current");
		if (item.classList.contains("sfitem")) {
			document.getElementById('removebutton').disabled=false;
			//document.getElementById('addbutton').disabled=false;
		}
		else {
			document.getElementById('removebutton').disabled=true;
			//document.getElementById('addbutton').disabled=true;
		}
		document.getElementById('nameinput').value=dateId;
	}
	function dragStart_handler(ev) {
		//ev.dataTransfer.dropEffect = "link";
		// console.log('drag');
		ev.dataTransfer.setData("text/plain", ev.target.dataset.id);
	};

	function dragOver_handler(ev) {
		ev.preventDefault();
		//ev.dataTransfer.dropEffect = "move";
	};
	function drop_handler(ev) {
		// console.log('drop');
		ev.preventDefault();
		ev.stopPropagation();
		const data = ev.dataTransfer.getData("text/plain");
		let target=ev.target;
		if (!target.dataset.id) {
			target=ev.target.parentElement;
		}
		let targedId=target.dataset.id;
		if (targedId!==data) {
			if (target.className.startsWith('sfitem')) {
				tree.addChild(tree.getNodeByName(data),tree.getNodeByName(targedId));
			}
			else if (target.className.startsWith('spitem')) {
				tree.insertNode(tree.getNodeByName(data),tree.getNodeByName(targedId));
			}
/*			if (ControlKeyPressed && target.className.startsWith('sfitem')) {
				tree.addChild(tree.getNodeByName(data),tree.getNodeByName(targedId));
			} else {
				tree.insertNode(tree.getNodeByName(data),tree.getNodeByName(targedId));
			};
*/
			let curr=targedId;
			renderList();
			setCurrent(curr);
		}
	};
	function dragEnter_handler(e) {
		// console.log('enter');
	}
	function dragLeave_handler(e) {
		e.stopPropagation();
		// console.log('leave');
	}
	function dragEnd_handler(e) {
	}
	
// ------------------------------------
//	let ControlKeyPressed=false;
	let tree=new Tree('0');
	let current=null;
	await sleep(100);
	await browser.runtime.sendMessage({getTree: true}).then(getTreeCb,onError);
	await renderList();
	const placeholders = Array.from(document.querySelectorAll('[data-i18n]'));
     placeholders.forEach(span => {
		const i18n = span.dataset.i18n;
		const text = browser.i18n.getMessage(i18n);
		span.textContent = text;
	});
	
	document.getElementById('addbutton').addEventListener('click', () => {
		//addEngine;
		const engineName=document.getElementById('nameinput').value;
		if (engineName==='') {
			document.getElementById('nameinput').focus();
			return;
		}
		if (tree.getNodeByName(engineName) && tree.getNodeByName(engineName).name===engineName) {
			document.getElementById('nameinput').focus();
			browser.notifications.create({
				"type": "basic",
				"title": browser.i18n.getMessage("oseName"),
				"message": browser.i18n.getMessage("nameUnique")
			});
			return;
		}
		let node=new Node(engineName);
		node.type=1;
		node.icon='';
		tree.addNode(node);
		renderList();
	});
	document.getElementById('removebutton').addEventListener('click', () => {
		const li=document.querySelector("[data-id='"+current+"']");
		let node=tree.getNodeByName(li.childNodes[1].textContent);
		if (!node) { 
			return;
		}
		let curr=null;
		if (li.previousSibling){
			curr=li.previousSibling.dataset.id;
		}
		else if (li.nextSibling){
			curr=li.nextSibling.dataset.id;
		}
		tree.deleteNode(node,false);
		renderList();
		setCurrent(curr);
	});

	document.getElementById('splist').addEventListener('click', () => {
		// click on engine
		let item = event.target.closest(['.spitem','.sfitem']);
		if (!item) { return;}
		if (current===item.dataset.id) {
			return;
		};
		setCurrent(item.dataset.id);
		//event.preventDefault();
	});
	document.getElementById('savebutton').addEventListener('click', saveButton);
	async function saveButton(){
		await browser.runtime.sendMessage({saveTree: tree});
	};
/*
	document.addEventListener('keydown', event => {
		if (event.keyCode==17) {
			ControlKeyPressed=true;
		}
	});
	document.addEventListener('keyup', event => {
		if (event.keyCode==17) {
			ControlKeyPressed=false;
		}
	});
*/	
}());