document.addEventListener('contextmenu', event => event.preventDefault());

// Creates new toolbar without event processing
var toolbar = null;

// Creates the model and the graph inside the container
// using the fastest rendering available on the browser
var model = new mxGraphModel();
var graph = null;
var keyHandler = null;
var outline = null;
var outln = null;
var selectedShape = null;

function main(tbContainer, container){

	// Defines an icon for creating new connections in the connection handler.
	// This will automatically disable the highlighting of the source vertex.
	//mxConnectionHandler.prototype.connectImage = new mxImage('assets/images/connector.gif', 16, 16);

	// Checks if browser is supported
	if (!mxClient.isBrowserSupported())
	{
		// Displays an error message if the browser is
		// not supported.
		mxUtils.error('Browser is not supported!', 200, false);
	}
	else
	{	
		// object toolbar
		toolbar = new mxToolbar(tbContainer);
		toolbar.enabled = false

		// graph object
		graph = new mxGraph(container, model);

		keyHandler = new mxKeyHandler(graph);

		graph.dropEnabled = true;
		graph.centerZoom = false;
		//graph.panningHandler.useLeftButtonForPanning = true;
		graph.panningHandler.popupMenuHandler = false;


		new mxCircleLayout(graph).execute(graph.getDefaultParent());
		new mxParallelEdgeLayout(graph).execute(graph.getDefaultParent());

		// Enables new connections in the graph
		graph.setConnectable(true);
		graph.setMultigraph(false);
		graph.setTooltips(true);
		graph.setAllowDanglingEdges(false);
		graph.setConnectableEdges(true);
		graph.setPortsEnabled(false);	
		graph.setPanning(true);

		// drag selection on drawing board
		var rubberband = new mxRubberband(graph);

		// styles
		var style = graph.getStylesheet().getDefaultEdgeStyle();
		
		style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
		style[mxConstants.STYLE_ELBOW] = mxConstants.ELBOW_VERTICAL;
		style[mxConstants.STYLE_ROUNDED] = true;

		// show rotation point
		mxVertexHandler.prototype.rotationEnabled = true;

		// for popup auto expand
		graph.popupMenuHandler.autoExpand = true;

		// for points
		mxConstraintHandler.prototype.pointImage = new mxImage('assets/images/dot.gif', 10, 10);		

		// for page view
		// Creates the outline (navigator, overview) for moving
		// around the graph in the top, right corner of the window.
		outline = document.getElementById('outlineContainer');
		outln = new mxOutline(graph, outline);
		
		objectToolbar();	// object toolbar items
		popupInstall()		// popup on shape
		shapeSelectEvent(); // detect shape select
		connectionP2P();	// point to point connection
		deleteItemOnDelBtn();		// delete item from drawing board
		//pageView();			// for page view 
		dragDrop();



		graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt)
		{
			var edge = evt.getProperty('cell');
			var source = graph.getModel().getTerminal(edge, true);
			var target = graph.getModel().getTerminal(edge, false);
			//debugger;
			var validate = validateEdge(source.shape_id, target.shape_id);
			if(validate != ""){
				showToaster(3, validate);
				graph.getModel().remove(edge);
				updateSelectedShape(null);
			}

		});

	}
};

// function to add item into toolbar
function objectToolbar(){

	loadXMLShapes();

	var addVertex = function(icon, w, h, style,params)
	{
		var vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);

		vertex.shape_id = params.shape_id;
		vertex.shape = params.shape;
		vertex.technical = params.params;

		vertex.setVertex(true);

		addToolbarItem(graph, toolbar, vertex, icon);
	};

	addVertex('assets/shape_images/dish-antenna.png', 50, 90, 'shape=dish-antenna',tp_dishantenna());
	addVertex('assets/shape_images/battery.png', 120, 50, 'shape=battery',tp_battery());
	addVertex('assets/shape_images/annotation.png', 150, 40, 'shape=annotation',tp_annotation());
	addVertex('assets/shape_images/diamond.png', 40, 40, 'shape=diamond',tp_diamond());
	addVertex('assets/shape_images/3dbox.png', 40, 40, 'shape=3dbox',tp_3dbox());
	addVertex('assets/shape_images/cloud.png', 70, 40, 'shape=cloud',tp_cloud());
	addVertex('assets/shape_images/comlink.png', 70, 40, 'shape=comm-link',tp_commlink());
	addVertex('assets/shape_images/dvr.png', 70, 40, 'shape=dvr',tp_dvr());
	addVertex('assets/shape_images/hub.png', 70, 40, 'shape=hub',tp_hub());
	addVertex('assets/shape_images/laptop.png', 70, 40, 'shape=laptop',tp_laptop());

};

// function to add items into toolbar
function addToolbarItem(graph, toolbar, prototype, image){
	// Function that is executed when the image is dropped on
	// the graph. The cell argument points to the cell under
	// the mousepointer if there is one.
	var funct = function(graph, evt, cell)
	{
		//debugger;
		graph.stopEditing(false);

		var pt = graph.getPointForEvent(evt);
		var vertex = graph.getModel().cloneCell(prototype);
		vertex.geometry.x = pt.x;
		vertex.geometry.y = pt.y;	
		
		//updateSelectedShape(vertex);

		graph.setSelectionCells(graph.importCells([vertex], 0, 0, cell));

		//graph.getChildVertices(graph.getDefaultParent())[graph.getChildVertices(graph.getDefaultParent()).length - 1].rashid = "rashid";

		//var flag = graph.getChildVertices(graph.getDefaultParent())[graph.getChildVertices(graph.getDefaultParent()).length - 1].hasAttribute("rashid");
		//console.log(flag);
		updateSelectedShape(graph.getChildVertices(graph.getDefaultParent())[graph.getChildVertices(graph.getDefaultParent()).length - 1]);
		
		
		//debugger;
	}

	// Creates the image which is used as the drag icon (preview)
	var img = toolbar.addMode(null, image, funct);
	mxUtils.makeDraggable(img, graph, funct);
};

// function to install popup on shape
function popupInstall(){
	// Installs context menu
	graph.popupMenuHandler.factoryMethod = function(menu, cell, evt)
	{
		if(cell != null){
			
			//debugger;
			menu.addItem('copy', null, function()
			{
				console.log("copy shape");
			});

			menu.addSeparator();
			
			menu.addItem('Delete', null, function()
			{
				deleteItem();
			});

			
			/*
			var submenu1 = menu.addItem('Submenu 1', null, null);
			
			menu.addItem('Subitem 1', null, function()
			{
				alert('Subitem 1');
			}, submenu1);
			menu.addItem('Subitem 1', null, function()
			{
				alert('Subitem 2');
			}, submenu1);
			*/
		}
	};
};

// load xml shapes
function loadXMLShapes(){
	// for flow chart
	var req = mxUtils.load('assets/xmlshapes/shapes.xml');
	var root = req.getDocumentElement();
	var shape = root.firstChild;

	while (shape != null)
	{
		if (shape.nodeType == mxConstants.NODETYPE_ELEMENT)
		{
			mxStencilRegistry.addStencil(shape.getAttribute('name'), new mxStencil(shape));
		}
		
		shape = shape.nextSibling;
	}
};

// function shape selection
function shapeSelectEvent(){
	graph.fireMouseEvent = function(evtName, me, sender)
	{
		if (evtName == mxEvent.MOUSE_DOWN && me.getCell() != null)
		{
			// For hit detection on edges
			me = this.updateMouseEvent(me);
			updateSelectedShape(me.getCell());
		}else if(evtName == mxEvent.MOUSE_DOWN  && me.getCell() == null){
			updateSelectedShape(null);
		}
		
		mxGraph.prototype.fireMouseEvent.apply(this, arguments);
	};
};

function connectionP2P(){

	// only connect to port/connectors of shape 
	graph.connectionHandler.isConnectableCell = function(cell)
	{
		return false;
	};
	mxEdgeHandler.prototype.isConnectableCell = function(cell)
	{
		return graph.connectionHandler.isConnectableCell(cell);
	};

};

// function to show xml of draw graph
function showGraphXML(){
	var encoder = new mxCodec();
	var node = encoder.encode(graph.getModel());
	console.log("node",node);
	mxUtils.popup(mxUtils.getPrettyXml(node), true);
}; 

// bind key event for delete button
function deleteItemOnDelBtn(){
	// Removes cells when [DELETE] is pressed
	keyHandler.bindKey(46, function(evt){
		deleteItem();
	});
}

// delete currently selected item on drawing board
function deleteItem(){
	if (graph.isEnabled()){
		graph.removeCells();
		updateSelectedShape(null);
	}else{
		alert("No shape selected for delete");
	}
};

// function to zoom-in
function zoomIn(){
	graph.zoomIn();
};

// function to zoom-out
function zoomOut(){
	graph.zoomOut();
};

// function to reset zoom
function zoomActual(){
	graph.zoomActual();
};

function printView(){
	var preview = new mxPrintPreview(graph, 1);
	preview.open();
};


function updateSelectedShape(shape){
	selectedShape = shape;
	console.log("selectedShape",selectedShape);

	

	if(selectedShape != null && selectedShape.vertex){
		// update value in property window
		// general
		document.getElementById("shape_id").value = selectedShape.id;
		document.getElementById("shape_shape").value = selectedShape.shape;
		document.getElementById("shape_value").value = selectedShape.value;
		document.getElementById("shape_x").value = selectedShape.geometry.x;
		document.getElementById("shape_y").value = selectedShape.geometry.y;
		document.getElementById("shape_width").value = selectedShape.geometry.width;
		document.getElementById("shape_height").value = selectedShape.geometry.height;

		// technical
		var technical_params = '';
		for (var key in selectedShape.technical) {
			if (selectedShape.technical.hasOwnProperty(key)) {
				technical_params += '<tr><th>' + key + '</th><td>' + selectedShape.technical[key] + '</td></tr>';
			}
		}
		document.getElementById('tp_body').innerHTML = technical_params;

		// display block
		document.getElementById('properties').style.display = 'block';
		

		var value = mxUtils.getValue(graph.view.getState(shape).style,mxConstants.STYLE_ROTATION,0)
		//console.log("rotation",value);
		//console.log("isShape?",selectedShape.vertex);
	}else{
		// display hide
		document.getElementById('properties').style.display = 'none';
	}
	
};

function updateSelectedShapeValues(){
	//alert();
	if(selectedShape != null){
		selectedShape.geometry.x = document.getElementById('shape_x').value;
		selectedShape.geometry.y = document.getElementById('shape_y').value;
		selectedShape.geometry.width = document.getElementById('shape_width').value;
		selectedShape.geometry.height = document.getElementById('shape_height').value;
		updateValueSelectedShape(document.getElementById('shape_value').value);
		graph.refresh();
		console.log("selectedShape",selectedShape);
	}
};

function updateValueSelectedShape(value){
	if(selectedShape!=null){
		var index = graph.getChildVertices(graph.getDefaultParent()).indexOf(selectedShape);
		graph.getChildVertices(graph.getDefaultParent())[index].setValue(value);
		graph.refresh();
	}
};

function dragDrop(){
	graph.addListener(mxEvent.CELLS_MOVED, function(sender, evt)
	{
		var e = evt.getProperty('event'); // mouse event
		evt.consume();
		if(selectedShape != null){
			updateSelectedShape(selectedShape);
		}
	});
};

//var cell = graph.getSelectionCell(); // get currently selected cell