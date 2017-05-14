// 2D HTML / JavaScript UI

window.Vegebot = window.Vegebot || {};

function initVegebotUI() {
	console.log('Initializing 2D UI...');

}

function update2DUIWithLettuceHypothesis(lettuceHypothesis) {
	//console.log('Updating 2D UI display with Lettuce Hypothesis.');
	console.log(window.LettuceList.length);
	var menuItems = d3.select('#lettuce-menu')
		.selectAll('div')
		.data(window.LettuceList)

	var menuItemsEnter = menuItems	
		.enter()
		.append('div')
		.attr('class', 'pure-u-1 pure-u-md-1-2 lettuce-menu-item');

	menuItemsEnter.append('span')
		.text(function(d) {
			var pos = d.pose.position,
				posLabel = ' (' + pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + pos.z.toFixed(2) + ') ';
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

	// addPosButtons(menuItemsEnter, 'pos', id);	

	// var forms = menuItemsEnter.append('form')
	// 	.attr('onsubmit', 'changeCoordinates(event);')
	// 	.attr('action', '#')
	// 	.attr('class', 'pure-form')
	// 	.attr('id', function(d) {
	// 		return 'pos-' + d.id;
	// 	});

	// var fieldsets = forms.append('fieldset');
	// fieldsets.append('input')
	// 	.attr('name', function(d) {
	// 		return 'pos-' + d.id;
	// 	})


	menuItems
		.exit()
		.remove();	

}
window.Vegebot.update2DUIWithLettuceHypothesis = update2DUIWithLettuceHypothesis;

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
