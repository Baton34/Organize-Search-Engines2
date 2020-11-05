//import Tree2 from "/js/tree.js";
(async function() {
console.log('bgs starting---------');


var settings ={
	defaultEngine : null,
	defaultEngineIcon : null,
	version: "0.0.2",
	engineTree: null
	
}
//browser.notifications.create({
// "type": "basic",
// "iconUrl": browser.extension.getURL("link.png"),
// "title": "You clicked a link!",
// "message": message.url
//);
function onError(error) {
  console.error(`OSE2 Error: ${error}`);
}

const config = await (async function() {
	var needWriteConfig=false;

	const readConfig = async function() {
	//	console.log('search in local');
		const local = await browser.storage.local.get();
		if (local.defaultEngine) {
			return local;
		}
		else {
	//		console.log('search in sync');
			const sync =await browser.storage.sync.get();
	//		console.log(sync);
			if (sync.defaultEngine) {
				return sync;
			}
			let sett = {
				defaultEngine : null,
				defaultEngineIcon : null,
				version : "1",
				engineTree : null
			}
			let engines = await browser.search.get();
			let tree=new Tree('0');
			for (let engine of engines) {
				if (engine.isDefault) {
					if (engine.isDefault!='OSE2') {
						sett.defaultEngine=engine.name;
						sett.defaultEngineIcon=engine.favIconUrl;
						console.log('set default data');
					}
				}
				let node=new Node(engine.name);
				node.icon=engine.favIconUrl;
				node.type=0;  
				tree.addNode(node); 
			}
			sett.engineTree=tree;
			needWriteConfig=true;
			return sett;
		}
	}
	const getNeedWriteConfig = function() {
		return needWriteConfig;
	}
	const writeConfig = async function() {
		const name=settings.defaultEngine;
		const icon=settings.defaultEngineIcon;
		const tree=settings.engineTree;
		const ver=settings.version
		await browser.storage.local.set({defaultEngine: name, defaultEngineIcon: icon, version: ver, engineTree: tree});
	}
	return {
		readConfig,
		writeConfig,
		getNeedWriteConfig
	};
}());
const updateButton = function () {
	const icon=settings.defaultEngineIcon;
	const name=settings.defaultEngine;
	browser.browserAction.setIcon({ path: icon });
	const title = browser.i18n.getMessage('oseButtonTitle')
		.replace(/%s/ig, () => name);
	browser.browserAction.setTitle({ title });
};

async function closeTabs(tabs) {
	for (let tab of tabs) {
		await browser.tabs.remove(tab.id);
	}
}

const catchRequest=async function(details){
	try {
		const url = new URL(details.url);
		const type = url.pathname.slice(1);
		const searchTerms = url.searchParams.get('searchTerms') || '';
		let querying = browser.tabs.query({
			currentWindow: true,
			status: "loading",
			title: "9f098a71-45f7-4380-a829-25a6f86503bd.invalid/search?searchTerms=*"
		});
		querying.then(closeTabs, onError);
		browser.search.search({
			query: searchTerms,
			engine: settings.defaultEngine
		});
    } catch (_ignore) { /* fallthrough */ }
    return { cancel: true }; 
};

async function notify(message) {
	// console.log('bSc inMess:');
	// console.log(message);
	if (message.setDefault) {
		settings.defaultEngine = message.setDefault;
		settings.defaultEngineIcon = message.favIconUrl;
		updateButton(settings);
		await config.writeConfig();
	}
	else if (message.getTree) {
		return Promise.resolve(settings.engineTree);
	}
	else if (message.saveTree) {
		settings.engineTree=message.saveTree;
		await config.writeConfig();
	}
	else {
		console.log("not known message");
	}
}

const checkEnginesUpdate=async function() {
	let checkState="";
	let tree=new Tree('0');
	tree.fillIn(settings.engineTree);
	let engines = await browser.search.get();
	let nodesToDelete=[];
	let callback = function(node) {
		if (node.type == 0 && node.parent) {
			const engineIndex=engines.findIndex(({name}) => name===node.name);
			if (engineIndex >= 0) {
				engines.splice(engineIndex,1);
			} else{
				nodesToDelete.push(node);
			};
		};
	};
	tree.contains(callback);
	if (nodesToDelete.length>0) {
		checkState+=browser.i18n.getMessage("deletedEngines");
		for (let i=0; i<nodesToDelete.length; i++){
			tree.deleteNode(nodesToDelete[i],false);
			checkState+=nodesToDelete[i].name+", ";
		};
		checkState+="\n";
	};
	if (engines.length>0){
		checkState+=browser.i18n.getMessage("addedEngines");
		for (let i=0; i<engines.length; i++){
			let node=new Node(engines[i].name);
			node.icon=engines[i].favIconUrl;
			node.type=0;  
			tree.addNode(node);
			checkState+=engines[i].name+", ";
		};
		checkState+="\n";		
	};
	if (checkState!="") {
		settings.engineTree=tree;
		await config.writeConfig();
	};
	
	return Promise.resolve(checkState);
}

async function enginesUpdateChecked(checkState) {
	if (checkState!="") {
		browser.notifications.create({
			"type": "basic",
			"title": browser.i18n.getMessage("oseName"),
			"message": checkState
		});
	};
}


/* -------------------------------------------------------- */
	settings=await config.readConfig();
	if (config.getNeedWriteConfig()) { 
		await config.writeConfig();
	}
	else {
		checkEnginesUpdate().then(enginesUpdateChecked);
	}
	browser.runtime.onMessage.addListener(notify);
	updateButton();

	browser.webRequest.onBeforeRequest.addListener(catchRequest, 
		{urls: ["https://9f098a71-45f7-4380-a829-25a6f86503bd.invalid/*"], types: ["main_frame"]},
		["blocking"]
	);
	console.log('bgs---------started');
}());