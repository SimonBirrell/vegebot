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


	menuItemsEnter.append('button')
		.attr('class', 'pure-button lettuce-pick-button')
		.attr('onClick', 'pickLettuce(this.id)')
		.attr('id', buttonId)
		.text('Full Pick');	

	menuItemsEnter.append('button')
		.attr('class', 'pure-button lettuce-pick-button')
		.attr('onClick', 'nextAction(this.id)')
		.attr('id', buttonId)
		.text('Next action');	

	menuItemsEnter.append('button')
		.attr('class', 'pure-button lettuce-pick-button')
		.attr('onClick', 'action(this.id)')
		.attr('id', buttonId)
		.text('Action');	

	menuItems
		.exit()
		.remove();	

}
window.Vegebot.update2DUIWithLettuceHypothesis = update2DUIWithLettuceHypothesis;

function updateParameterList(parameterList) {
	var parameterItems = d3.select('#parameters')
		.selectAll('div')
		.data(parameterList);

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
		.attr('name', function(d){
			return d.id;
		})
		.attr('onclick', 'foo');

	fieldsets.append('input')
		.attr('class', 'pure-button')
		.attr('type', 'submit')
		.attr('value', 'Submit')
		.text('update');	

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
		fieldName = formId;
	console.log(formId);
	var value = document.getElementById(formId+'['+fieldName+"]").value;
	console.log(value);
	return true;
}
