// 2D HTML / JavaScript UI

window.Vegebot = window.Vegebot || {};

var LettucePlacingMode = false;
var CameraViewPortWidth = 640,
	CameraViewPortHeight = 480;

function initVegebotUI() {
	console.log('Initializing 2D UI...');

}

function update2DUIWithLettuceHypothesis(lettuceHypothesis) {
	//console.log('Updating 2D UI display with Lettuce Hypothesis.');
	console.log(window.LettuceList.length);

	setUpMouseHandlers();
	drawLettuceOverlays();
	drawMenus(lettuceHypothesis);
}
window.Vegebot.update2DUIWithLettuceHypothesis = update2DUIWithLettuceHypothesis;

function setUpMouseHandlers() {

		var svg = d3.select('#video-overlay');

		svg.on('click', function() {
			if (LettucePlacingMode) {
				//alert("LettucePlacingMode active!");
				var coords = d3.mouse(this);
				var newLettuce = addUserLettuceAtXY(coords[0], coords[1], 40);
			} else {
				//alert("LettucePlacingMode not active. iognoring click");
			}
			LettucePlacingMode = false;
		});
}

// Adds a User/generated Lettuce Hypothesis
//
function addUserLettuceAtXY(x, y, r) {
	window.Vegebot.UserGeneratedLettuceHypothesisId = window.Vegebot.UserGeneratedLettuceHypothesisId || 9999;
	window.Vegebot.UserGeneratedLettuceHypothesisId++;

	var lettuce_hypothesis_id = window.Vegebot.UserGeneratedLettuceHypothesisId.toString(),
		lettuceHypothesis = {
			lettuce_hypothesis_id: lettuce_hypothesis_id,
			label: "user_lettuce_" + lettuce_hypothesis_id,
			camera_bb_x: x / CameraViewPortWidth,
			camera_bb_y: y / CameraViewPortHeight,
			camera_bb_width: (r * 2.0) / CameraViewPortWidth,
			camera_bb_height: (r * 2.0) / CameraViewPortHeight,
			probability: 0.95,
			pose: {
				orientation: {
					w: 0.0,
					x: 0.0,
					y: 0.0,
					z: 0.0
				},
				position: {
					x: 0.0,
					y: 0.0,
					z: 0.0
				}
			}
		};

	//window.LettuceList.push(lettuceHypothesis);
	//update2DUIWithLettuceHypothesis(lettuceHypothesis);
	window.lettuceUpdateFromViewport(lettuceHypothesis);

	return lettuceHypothesis;
}

function publishLettuceHypothesisUpdate(lettuceHypothesis) {
	var lettuceHypothesisId = lettuceHypothesis.lettuce_hypothesis_id,
		lettuceHypothesisCopy = {
			lettuce_hypothesis_id: lettuceHypothesisId,
			label: "user_lettuce_" + lettuceHypothesisId,
			camera_bb_x: lettuceHypothesis.camera_bb_x,
			camera_bb_y: lettuceHypothesis.camera_bb_y,
			camera_bb_width: lettuceHypothesis.camera_bb_width,
			camera_bb_height: lettuceHypothesis.camera_bb_height,
			probability: lettuceHypothesis.probability,
			pose: {
				orientation: {
					w: 0.0,
					x: 0.0,
					y: 0.0,
					z: 0.0
				},
				position: {
					x: 0.0,
					y: 0.0,
					z: 0.0
				}
			}
		};
	window.lettuceUpdateFromViewport(lettuceHypothesisCopy);			
}

function  drawLettuceOverlays() {
	var lettuceOverlays = d3.select('#video-overlay')
		.selectAll('g') // circle
		.data(window.LettuceList, function(d) {
			return d.lettuce_hypothesis_id;
		});

	var lettuceOverlaysEnter = lettuceOverlays
		.enter()
		.append('g')
		.attr('class', 'overlay')
		.attr('transform', function(d){
			return "translate(" + d.camera_bb_x * 640 + "," + d.camera_bb_y * 480 + ")";
		})
		.call(d3.drag()
        	.on("start", dragstarted)
        	.on("drag", dragged)
        	.on("end", dragended));

		function dragstarted(d) {
  			d3.select(this).raise().classed("active-overlay", true);
		}

		function dragged(d) {
		  d3.select(this)
		  	.attr("transform", function(d) {
		  		var x = d3.event.x / 640.0,
		  			y =	d3.event.y / 480.0;
		  			console.log("x " + x.toString());
		  			console.log("y " + y.toString());
		  		d.camera_bb_x = x;
		  		d.camera_bb_y = y;
				return "translate(" + d3.event.x + "," + d3.event.y + ")";
		  	});
		  //publishLettuceHypothesisUpdate(d);
		}

		function dragended(d) {
		  d3.select(this).classed("active-overlay", false);
		  console.log(d);
		  publishLettuceHypothesisUpdate(d);
		};

	lettuceOverlaysEnter
		.append('circle')
		.attr('r', function(d) {
			return 640.0 * d.camera_bb_width / 2.0;
		})
		.attr('style', 'stroke-width:2;fill:none;');

	lettuceOverlaysEnter
		.append('text')
		.text(function(d){
			return d.lettuce_hypothesis_id;
		})
		.attr('style', 'color:red;')
		.attr('x', 0)
		.attr('y', 20)
		.attr('fill','red')
		.attr('text-anchor', 'middle');


	lettuceOverlaysEnter
		.append('circle')
		.attr('r','2')
		.attr('style', 'stroke-width:5;fill:none;');

	lettuceOverlays
		.exit()
		.remove();	
}

function drawMenu(lettuceHypothesis) {
	var menuItems = d3.select('#lettuce-menu')
		.selectAll('div')
		.data(window.LettuceList);

	var rowDivs = menuItems	
		.enter()
		.append('div')
		.attr('class', 'pure-u-1-1 lettuce-menu-item-holder')
		;

		//.append('div')
		//.attr('class', 'pure-u-1 pure-u-md-1-1 lettuce-menu-item')
		;

	var menuItemsEnter = rowDivs
		.append('div')
		.attr('class', 'pure-u-1-2 lettuce-menu-item')
		;

	var menuButtons = rowDivs
		.append('div')
		.attr('class', 'pure-u-1-2 lettuce-menu-item')
		;

	menuItemsEnter.append('button')
		.attr('class', 'pure-button lettuce-close-button')
		.attr('onClick', function(d) {
			return "clearLettuce(" + d.lettuce_hypothesis_id.toString() + ");"
		})
		.text("X");	

	menuItemsEnter.append('span')
		.text(function(d) {
			var pos = d.pose.position,
				posLabel = ' 3D (' + pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + 
				pos.z.toFixed(2) + ') BB (' + 
				d.camera_bb_x.toFixed(2) + ', ' + d.camera_bb_y.toFixed(2) + ', ' + 
				d.camera_bb_width.toFixed(2) + ', ' + d.camera_bb_height.toFixed(2) + ')';
			return 'Lettuce # ' + d.lettuce_hypothesis_id + posLabel;
		});

	var buttonId = 'button-pick-' + lettuceHypothesis.lettuce_hypothesis_id;

	var id = lettuceHypothesis.lettuce_hypothesis_id;
	addButtons(menuButtons, 'pick', 'all', id);	
	addButtons(menuButtons, 'release', 'rel', id);	
	addButtons(menuButtons, 'place', 'pla', id);	
	addButtons(menuButtons, 'up', 'up', id);	
	addButtons(menuButtons, 'cut', 'cut', id);	
	addButtons(menuButtons, 'down', 'dwn', id);	
	addButtons(menuButtons, 'pregrasp', 'pre', id);	

	if (lettuceHypothesis.lettuce_hypothesis_id == "0") {
		var lettuceZeroX = d3.select('#lx0').attr("value", lettuceHypothesis.pose.position.x),
			lettuceZeroX = d3.select('#ly0').attr("value", lettuceHypothesis.pose.position.y),
			lettuceZeroX = d3.select('#lz0').attr("value", lettuceHypothesis.pose.position.z);
	}

	menuItems
		.exit()
		.remove();	
}

function drawMenus(lettuceHypothesis) {
	console.log("redrawing menus with " + LettuceList.length.toString() + " lettuces.");
	var menuItems = d3.select('#lettuce-menu')
		.selectAll('.lettuce-menu-item-holder')
		.data(window.LettuceList, function(d) {
			return d.lettuce_hypothesis_id;
		});

	var rowDivs = menuItems	
		.enter()
		.append('div')
		.attr('class', 'pure-u-1-1 lettuce-menu-item-holder')
		.attr('id', function(d) {
			console.log(d.lettuce_hypothesis_id);
			return "lettuce-menu-item-holder-" + d.lettuce_hypothesis_id;
		})
		;

		//.append('div')
		//.attr('class', 'pure-u-1 pure-u-md-1-1 lettuce-menu-item')
		;

	var menuItemsEnter = rowDivs
		.append('div')
		.attr('class', 'pure-u-1-2 lettuce-menu-item')
		;

	var menuButtons = rowDivs
		.append('div')
		.attr('class', 'pure-u-1-2 lettuce-menu-item')
		;

	menuItemsEnter.append('button')
		.attr('class', 'pure-button lettuce-close-button')
		.attr('onClick', function(d) {
			return "clearLettuce(" + d.lettuce_hypothesis_id.toString() + ");"
		})
		.text("X");	

	menuItemsEnter.append('span');
		// .text(function(d) {
		// 	var pos = d.pose.position,
		// 		posLabel = ' 3D (' + pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + 
		// 		pos.z.toFixed(2) + ') BB (' + 
		// 		d.camera_bb_x.toFixed(2) + ', ' + d.camera_bb_y.toFixed(2) + ', ' + 
		// 		d.camera_bb_width.toFixed(2) + ', ' + d.camera_bb_height.toFixed(2) + ')';
		// 	return 'Lettuce # ' + d.lettuce_hypothesis_id + posLabel;
		// });

	var buttonId = 'button-pick-' + lettuceHypothesis.lettuce_hypothesis_id;

	addMenuButtons(menuButtons, 'pick', 'all');	
	addMenuButtons(menuButtons, 'release', 'rel');	
	addMenuButtons(menuButtons, 'place', 'pla');	
	addMenuButtons(menuButtons, 'up', 'up');	
	addMenuButtons(menuButtons, 'cut', 'cut');	
	addMenuButtons(menuButtons, 'down', 'dwn');	
	addMenuButtons(menuButtons, 'pregrasp', 'pre');	

	// if (lettuceHypothesis.lettuce_hypothesis_id == "0") {
	// 	var lettuceZeroX = d3.select('#lx0').attr("value", lettuceHypothesis.pose.position.x),
	// 		lettuceZeroY = d3.select('#ly0').attr("value", lettuceHypothesis.pose.position.y),
	// 		lettuceZeroZ = d3.select('#lz0').attr("value", lettuceHypothesis.pose.position.z);
	// }

	menuItems
		.select('span')
		.text(function(d) {
			var pos = d.pose.position,
				posLabel = ' 3D (' + pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + 
				pos.z.toFixed(2) + ') BB (' + 
				d.camera_bb_x.toFixed(2) + ', ' + d.camera_bb_y.toFixed(2) + ', ' + 
				d.camera_bb_width.toFixed(2) + ', ' + d.camera_bb_height.toFixed(2) + ')';
			return 'Lettuce # ' + d.lettuce_hypothesis_id + posLabel;
		});

	menuItems
		.exit()
		.remove();	
}

function addMenuButtons(containers, command, label) {
	containers.append('button')
		.attr('class', 'pure-button lettuce-pick-button')
		.attr('onClick', "doAction(this.id, '" + command + "');")
		.attr('id', function(d) {
			return 'button-' + command + '-' + d.lettuce_hypothesis_id.toString();
		})
		.text(label);		
}

function addButtons(containers, command, label, lettuceHypothesisId) {
	var buttonId = 'button-' + command + '-' + lettuceHypothesisId;

	containers.append('button')
		.attr('class', 'pure-button lettuce-pick-button')
		.attr('onClick', "doAction(this.id, '" + command + "');")
		.attr('id', buttonId)
		.text(label);	
}

function addPosButtons(containers, label, lettuceHypothesisId) {
	var buttonId = 'button-pos-' + lettuceHypothesisId;

	containers.append('a')
		.attr('class', 'pure-button lettuce-pick-button')
		.attr('data-toggle', 'modal')
		.attr('role', 'button')
		.attr('href', '#myModal')
		//.attr('onClick', "doAction(this.id, '" + command + "');")
		.attr('id', buttonId)
		.text(label);		
}

function updateParameterList() {
	var parameterItems = d3.select('#parameters')
		.selectAll('div')
		.data(window.Vegebot.rosParameters);

	var parameterItemsEnter = parameterItems
		.enter()
		.append('div')
		.attr('class', 'pure-u-1 pure-u-md-1-2 parameter-item');

	var forms = parameterItemsEnter.append('form')
			.attr('class', "pure-form")
			.attr('id', function(d){
				return d.id;
			})
			.attr('onsubmit', 'return submitParameterForm(event);')
			.attr('action', '#');

	var fieldsets = forms.append('fieldset');		

	fieldsets.append('label')
		.attr('for', function(d){
			return d.id;
		})
		.text(function(d){
			return d.name;
		});

	fieldsets.append('input')
		.attr('type', 'text')
		.attr('id', function(d){
			return formToFieldId(d.id);
		})
		.attr('name', function(d){
			return d.id;
		})
		.attr('value', function(d){
			return d.value;
		});

	fieldsets.append('input')
		.attr('class', 'pure-button')
		.attr('type', 'submit')
		.attr('value', 'Submit')
		.text('update');

	// Update any values if they change on the server
	// NOTE TODO: This always updates the DOM, doesn-t always update visible page
	parameterItems.select('form')
		.select('input')
		.attr('value', function(d){
			//console.log("setting value in UI to");
			//console.log(d.value);
			return d.value;
		});
}
window.Vegebot.updateParameterList = updateParameterList;

function updateVegebotStatus(message) {
	console.log("=============================");
	console.log(message);
	console.log("=============================");
	d3.selectAll("#vegebot-status").text(message);
}
window.updateVegebotStatus = updateVegebotStatus;

function submitParameterForm(e) {
	var formId = e.target.id,
		fieldId = formToFieldId(formId),
		value = document.getElementById(fieldId).value;
	window.Vegebot.submitParameter(formId, value);

	return false;
}

function formToFieldId(formId) {
	return formId + '-input';
}

function changeLettuceZeroCoordinates(e) {
	var x0 = document.getElementById('lx0').value,
		y0 = document.getElementById('ly0').value,
		z0 = document.getElementById('lz0').value;

	if (window.LettuceList.length>0) {
		console.log("Changing lettuce zero...");
		console.log(window.Lettuces);
		var lettuce = window.Lettuces['0'];
		console.log(lettuce.pose.position);
		lettuce.pose.position.x = parseFloat(x0);
		lettuce.pose.position.y = parseFloat(y0);
		lettuce.pose.position.z = parseFloat(z0);
		console.log(lettuce.pose.position);
		window.update3DdisplayWithLettuceHypothesis(window.Lettuces['0']);
	} else {
		console.log("******* lettuce zero not found ********");
	}

	return false;
}

var addLettuce = function() {
	LettucePlacingMode = true;
}
window.addLettuce = addLettuce;

var clearLettuces = function() {
	LettucePlacingMode = false;
	eraseLettuces();
}
window.clearLettuces = clearLettuces;

var clearLettuce = function(lettuce_hypothesis_id) {
	LettucePlacingMode = false;
	lettuce_hypothesis_id = lettuce_hypothesis_id.toString();
	console.log(lettuce_hypothesis_id);
	eraseLettuce(lettuce_hypothesis_id);
}
window.clearLettuce = clearLettuce;

var saveSample = function() {
	console.log("Saving sample...");
	openStreamAndSaveSample();
}
window.saveSample = saveSample;

var shakeItBaby = function() {
	console.log("Shake your thang");
	sendVegebotCommand('shake');
}
window.shakeItBaby = shakeItBaby;

var resetTilt = function() {
	console.log("Reset tilt.");
	sendVegebotCommand('reset_tilt');
}
window.resetTilt = resetTilt;

var tilt = function(axis, direction) {
	var command = 'tilt ' + axis.toString() + ' ' + direction.toString();
	console.log(command);
	sendVegebotCommand(command);
}
window.tilt = tilt;

var calibrate = function() {
	var command = 'calibrate';
	console.log(command);
	sendVegebotCommand(command);
}
window.calibrate = calibrate;