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
	drawMenu(lettuceHypothesis);
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

function  drawLettuceOverlays() {
	var lettuceOverlays = d3.select('#video-overlay')
		.selectAll('g') // circle
		.data(window.LettuceList);

	var lettuceOverlaysEnter = lettuceOverlays
		.enter()
		.append('g')
		.attr('transform', function(d){
			return "translate(" + d.camera_bb_x * 640 + "," + d.camera_bb_y * 480 + ")";
		});


	lettuceOverlaysEnter
		.append('circle')
		.attr('r', function(d) {
			return 640.0 * d.camera_bb_width / 2.0;
		})
		.attr('style', 'stroke:red;stroke-width:2;fill:none;');

	lettuceOverlaysEnter
		.append('text')
		.text(function(d){
			return d.lettuce_hypothesis_id;
		})
		.attr('style', 'color:red;')
		.attr('x', 0)
		.attr('y', 20)
		.attr('fill','red')
		.attr('text-anchor', 'middle')
		.call(d3.drag());

	lettuceOverlaysEnter
		.append('circle')
		.attr('r','2')
		.attr('style', 'stroke:red;stroke-width:2;fill:none;');

	lettuceOverlays
		.exit()
		.remove();	
}

function drawMenu(lettuceHypothesis) {
	var menuItems = d3.select('#lettuce-menu')
		.selectAll('div')
		.data(window.LettuceList);

	var menuItemsEnter = menuItems	
		.enter()
		.append('div')
		.attr('class', 'pure-u-1 pure-u-md-1-1 lettuce-menu-item');

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
	addButtons(menuItemsEnter, 'pick', 'all', id);	
	addButtons(menuItemsEnter, 'release', 'rel', id);	
	addButtons(menuItemsEnter, 'place', 'pla', id);	
	addButtons(menuItemsEnter, 'up', 'up', id);	
	addButtons(menuItemsEnter, 'cut', 'cut', id);	
	addButtons(menuItemsEnter, 'down', 'dwn', id);	
	addButtons(menuItemsEnter, 'pregrasp', 'pre', id);	

	if (lettuceHypothesis.lettuce_hypothesis_id == "0") {
		var lettuceZeroX = d3.select('#lx0').attr("value", lettuceHypothesis.pose.position.x),
			lettuceZeroX = d3.select('#ly0').attr("value", lettuceHypothesis.pose.position.y),
			lettuceZeroX = d3.select('#lz0').attr("value", lettuceHypothesis.pose.position.z);
	}

	menuItems
		.exit()
		.remove();	
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

