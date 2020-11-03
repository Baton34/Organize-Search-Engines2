const folderIcon=browser.runtime.getURL("/icons/folder.svg");
class Queue {
	constructor () {
		this.elements = [];
	}
	enqueue (e) {
		this.elements.push(e);
	};
	dequeue  () {
		return this.elements.shift();
	};  
}

// ---------- Tree -------------
// https://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
class Node {
	constructor (name) {
		// this.id=Math.floor((Math.random() * 10000) + 1)+name;
		this.name=name;
		this.icon=null;
		this.type=0;
		this.parent=null;
		this.children=[];
	}
}

class Tree {
	constructor (data) {
		this._root=new Node(data);
	}
	traverseBF (callback) {
		var queue = new Queue();
		queue.enqueue(this._root);
	     let currentTree = queue.dequeue();
	     while(currentTree){
			for (var i = 0, length = currentTree.children.length; i < length; i++) {
				queue.enqueue(currentTree.children[i]);
			}
			callback(currentTree);
			currentTree = queue.dequeue();
		}
	};
	traverseDF (callback) {
		(function recurse(currentNode) {
			callback(currentNode);
			for (var i = 0, length = currentNode.children.length; i < length; i++) {
				recurse(currentNode.children[i]);
			}
			
		})(this._root);
	};

//	contains (callback, traversal) {
	contains (callback) {
		//traversal.call(this, callback);
		this.traverseDF(callback);
	};
	addNode (data, toData) {
		if (typeof toData === 'undefined') {
			toData=this._root;
		}
		var child = data,
			parent = null,
			callback = function(node) {
				if (node.name === toData.name) {
					parent = node;
				}
			};
		this.contains(callback);
		if (parent) {
			child.parent = parent;
			parent.children.push(child);
		} else {
			throw new Error('Cannot add node to a non-existent parent.');
		}
	};
	findIndex(arr, data) {
		var index;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].name === data.name) {
				index = i;
				break;
			}
		}
		return index;
	};
	getNodeByName(name) {
		if (typeof name !== 'undefined') {
			if (name) {
				let findedNode = null;
				let callback = function(node) {
					if (node.name === name) {
						findedNode = node;
					}
				};
				this.contains(callback);
				return findedNode;
			}
		}
		return null;
	};
	deleteNode (data,withChildren) {
		var parent = null,
			index;
		var callback = function(node) {
			if (node.name === data.parent.name) {
				parent = node;
			}
		};
		this.contains(callback);
		if (parent) {
			//let parent=data.parent;
			if (!withChildren) {
				for (let node of data.children) {
					this.addNode(node, parent);
				}
			}
			index = this.findIndex(parent.children, data);
			if (index === undefined) {
				throw new Error('Node to remove does not exist.');
			} else {
				parent.children.splice(index,1);
			}
		} else {
			throw new Error('Parent does not exist.');
		}
	}
	fillIn(data){
		this._root=data._root;
	}
	insertNode(data,beforeNode) {
		var parent = null,
			index;
		var callback = function(node) {
			if (node.name === beforeNode.parent.name) {
				parent = node;
			}
		};
		this.contains(callback);
		if (parent) {
			
			index = this.findIndex(parent.children, beforeNode);
			if (index === undefined) {
				throw new Error('Node before does not exist.');
			} else {
				//let childToRemove = parent.children.splice(index, 1);
				if (data.parent) {
					// node moved
					this.deleteNode(data,true);
				};
				data.parent=parent;
				parent.children.splice(index, 0, data);
			}
		} else {
			throw new Error('Parent does not exist.');
		}
	}
	addChild(data,nodeToAdd) {
		// add node as child to another node
		if (nodeToAdd.parent.name===data.name) {
			// cant add myself to my child
			return;
		}
		var parent = null,
			index;
		// delete data from data parent children
		var callback = function(node) {
			if (data.parent && node.name === data.parent.name) {
				parent = node;
			}
		};
		this.contains(callback);
		if (parent) {
			index = this.findIndex(parent.children, data);
			if (index === undefined) {
				throw new Error('Addedable does not exist.');
			} else {
				parent.children.splice(index, 1);
			}
		}
		else {
			throw new Error('Parent does not exist.');
		}
		// add data to new parent children
		let newParent=null;
		callback = function(node) {
			if (node.name === nodeToAdd.name) {
				newParent = node;
			}
		};
		this.contains(callback);
		if (newParent) {
			data.parent=newParent;
			newParent.children.unshift(data);
		} else {
			throw new Error('newParent does not exist.');
		}
	}
	
	print() {
		console.log('------start tree list------');
		let i=-1;
		this.traverseDF(function(node) {
			console.log('['+i+'] name: '+node.name+' parent: '+ (node.parent ? node.parent.name :'null'));
			i++;
		});
		console.log('------end tree list------');
	}
	test1() {
		return this.getNodeByName('t1');
	};
}