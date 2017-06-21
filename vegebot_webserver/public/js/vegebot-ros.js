// ROS JS code for rendering 3D view and intyeracting with messages

	window.Vegebot = window.Vegebot || {};

	var Lettuces = {};
	window.Lettuces = Lettuces;

	var LettuceList = [];
	window.LettuceList = LettuceList;

	var Viewer;

	function init() {

		initVegebotUI();
		console.log('Initializing Vegebot ROS...');
		
		var ros = new ROSLIB.Ros({
			url: 'ws://localhost:9090'
		});

		ros.on('connection', function(){
			console.log("Connected to websocket server.");
		});

		ros.on('error', function(error){
			console.log("Error connecting to websocket server.", error);
		});

		ros.on('close', function(){
			console.log("Connection to websocket server closed.");
		});

		// Publishing a topic

		console.log("About to publish topics...");

		var vegebotCommands = new ROSLIB.Topic({
			ros: ros,
			name: '/vegebot_commands',
			messageType: 'std_msgs/String'
		});
		window.VegebotCommands = vegebotCommands;

		var lettuceUpdatesFromViewport = new ROSLIB.Topic({
			ros: ros,
			name: '/vegebot/lettuce_hypotheses/updates_from_viewport',
			messageType: 'vegebot_msgs/LettuceHypothesis'
		});
		window.LettuceUpdatesFromViewport = lettuceUpdatesFromViewport;

		var viewer = new ROS3D.Viewer({
			divID: 'urdf',
			width: 640, // 400
			height: 480, // 250
			antialias: true
		});
		Viewer = viewer;

		viewer.addObject(new ROS3D.Grid());

		var tfClient = new ROSLIB.TFClient({
			ros: ros,
			fixedFrame: 'world',
			angularThres: 0.01,
			transThres: 0.01,
			rate: 10.0
		});

		var urdfClient = new ROS3D.UrdfClient({
			ros: ros,
			tfClient: tfClient,
			path: '/',
			rootObject: viewer.scene,
			loader: ROS3D.COLLADA_LOADER_2
		});

		var lettuceHypothesesTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/vegebot/lettuce_hypotheses',
			messageType: 'vegebot_msgs/LettuceHypothesis'
		});

		createVirtualLettuceZero();

		console.log("Set up listener 2...");
		console.log(lettuceHypothesesTopic);

		lettuceHypothesesTopic.subscribe(
			receiveLettuceHypothesis
		);

		var statusTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/vegebot/status',
			messageType: 'std_msgs/String'
		});
		statusTopic.subscribe(
			receiveStatus
		);

		requestParameters();

		function receiveStatus(message) {
			var statusMessage = message.data;
			window.updateVegebotStatus(statusMessage);
		}

		// Receive an array of Lettuce Hypotheses
		// Display them in 3D and add or remove from menu

		function receiveLettuceHypothesis(lettuceHypothesis) {
			console.log("................................");
			console.log(lettuceHypothesis);
			console.log("................................");
			//alert(lettuceHypothesis.label);
			if (lettuceHypothesis.label=='RESET_ALL') {
				console.log('RESET_ALL received. Forgetting all lettuce Hypotheses...');
				console.log(Viewer.scene.children);
				eraseLettuces();
				return;
			}
			var lettuce_hypothesis_id = lettuceHypothesis.lettuce_hypothesis_id;
			//console.log("Lettuce ID: " + lettuce_hypothesis_id);
			//console.log(lettuceHypothesis);
			var previousLettuceHypothesis = Lettuces[lettuce_hypothesis_id];
			var radius = lettuceHypothesis.radius,
				x = lettuceHypothesis.pose.position.x,
				y = lettuceHypothesis.pose.position.y,
				z = lettuceHypothesis.pose.position.z;

			if (previousLettuceHypothesis) {
				// Updated lettuce
				console.log("Updating lettuce ID " + lettuce_hypothesis_id);
				//Lettuces[lettuce_hypothesis_id] = lettuceHypothesis;
			} else {
				// New lettuce
				console.log("New lettuce: " + lettuce_hypothesis_id);
				lettuceHypothesis.model3D = create3DLettuce(radius, x, y, z);
				addLettuce(lettuceHypothesis);
				//Lettuces[lettuce_hypothesis_id] = lettuceHypothesis;
				//LettuceList.push(lettuceHypothesis);
			}

			lettuceHypothesis = Lettuces[lettuce_hypothesis_id]; 
			update3DdisplayWithLettuceHypothesis(lettuceHypothesis);
			window.Vegebot.update2DUIWithLettuceHypothesis(lettuceHypothesis);
			//console.log("Now tracking " + Object.keys(Lettuces).length + " lettuces.")
		}

		function addLettuce(lettuceHypothesis) {
			var lettuce_hypothesis_id = lettuceHypothesis.lettuce_hypothesis_id;
			console.log("Adding lettuce " + lettuce_hypothesis_id + " to list and hash");
			Lettuces[lettuce_hypothesis_id] = lettuceHypothesis;
			LettuceList.push(lettuceHypothesis);			
		}

		function eraseLettuce(lettuce_hypothesis_id) {
			console.log("eraseLettuce " + lettuce_hypothesis_id);
			console.log("Before erasure we had " + LettuceList.length);
			var index = -1;
			for (var i=0; i<LettuceList.length; i++) {
				var id = LettuceList[i].lettuce_hypothesis_id;
				if (id==lettuce_hypothesis_id) {
					index = i;
					console.log("Index " + index.toString());
					break;
				}
			}
			if (index==-1) {
				console.log("ERROR: Can't find lettuce with id " + lettuce_hypothesis_id.toString());
				foo
				return;
			}

			var lettuceHypothesis = Lettuces[lettuce_hypothesis_id],
				scene = Viewer.scene,
				model3D = lettuceHypothesis.model3D;
			if (lettuceHypothesis.model3D) {
				console.log("Removing object from scene");
				scene.remove(model3D);
				//lettuceHypothesis.model3D.dispose();
			}
			console.log("Before splice we had " + LettuceList.length);	
			console.log("Splice " + index.toString());	
			console.log("About to splice lettuce at index " + index.toString());
			console.log("Whose ID is " + LettuceList[index].lettuce_hypothesis_id.toString());	
			LettuceList.splice(index, 1);
			console.log("After splice we had " + LettuceList.length);
			delete Lettuces[lettuce_hypothesis_id];
			console.log("After deletion we had " + LettuceList.length);
			update2DUIWithLettuceHypothesis(0);			
			console.log("After erasure we had " + LettuceList.length);
		}
		window.eraseLettuce = eraseLettuce;

		function eraseLettuces() {
			var lettuceLength = LettuceList.length;
			for (var i=lettuceLength-1; i>= 1; i--) {
				var lettuceHypothesis = LettuceList[i],
					lettuceHypothesisId = lettuceHypothesis.lettuce_hypothesis_id,
					scene = Viewer.scene,
					model3D = lettuceHypothesis.model3D;
				console.log(scene.children.length);	
				if (lettuceHypothesis.model3D) {
					console.log("Removing object from scene");
					//console.log(model3D);
					//console.log(scene);
					scene.remove(model3D);
					//lettuceHypothesis.model3D.dispose();
					LettuceList.splice(i);
					delete Lettuces[lettuceHypothesisId];
				}
				console.log(scene.children.length);
			}
			//Lettuces = {};
			//LettuceList = [];
			update2DUIWithLettuceHypothesis(0);
		}
		window.eraseLettuces = eraseLettuces;

		function createVirtualLettuceZero() {
			console.log("Creating fake lettuce for manual experiments.");

			var radius = 0.05308232043964489,
				x = 0.5,
				y = 0.0,
				z = 0.05;

			var lettuceHypothesis = {
 				lettuce_hypothesis_id: "0", 
 				pose: {
 					position: {
 						x: x,
 						y: y,
 						z: z
 					},
 					orientation: {
 						x: 0.0,
 						y: 0.0,
 						z: 0.0,
 						w: 0.0
 					}
 				}, 
 				radius: radius, 
 				probability: 0.99, 
 				label: "lettuce_0",
 				camera_bb_x: 0.0,
 				camera_bb_y: 0.0,
 				camera_bb_width: 40,
 				camera_bb_height: 40
			};

			window.LettuceList.push(lettuceHypothesis);
			window.Lettuces['0'] = lettuceHypothesis;
			lettuceHypothesis.model3D = create3DLettuce(radius, x, y, z);
			update3DdisplayWithLettuceHypothesis(lettuceHypothesis);
			window.Vegebot.update2DUIWithLettuceHypothesis(lettuceHypothesis);
		}

		function paramBelongsToVegebot(param) {
			return (param.substring(0,9)=="/vegebot/");
		}

		function requestParameters() {
			var filteredRosParams = [],
				rosParameters = [];
			//sendVegebotCommand('list_parameters');
			ros.getParams(function(params) {
    			filteredRosParams = params.filter(paramBelongsToVegebot);
    			//console.log("Parameters:");
    			//console.log(filteredRosParams);
    			for (var i=0; i<filteredRosParams.length; i++) {
    				var parameter_name = filteredRosParams[i],
    					parameter_id = parameterNameToId(parameter_name);
    				//console.log("-- " + parameter_name);
    				var param = new ROSLIB.Param({
    					ros : ros,
    					name : parameter_name
  					});
  					var parameterItem = {
  						param: param,
    					name: parameter_name,
    					id: parameter_id,
    					value: null
  					};
  					rosParameters.push(parameterItem);
					param.get(generateGetParamCallbackFunction(parameter_name));
    			}
  			});	
  			window.Vegebot.rosParameters = rosParameters;
  			setTimeout(function() {
  				updateParametersAndSetNextTimer();
  			}, 1000);
		}
		window.Vegebot.requestParameters = requestParameters;

		function generateGetParamCallbackFunction(parameter_name) {
			return Function("value","window.Vegebot.setParamCallback('" + parameter_name + "', value);")
		}

		function setParamCallback(name, value) {
			//console.log("Callback");
			//console.log(name);
			//console.log(value);
			for (var i=0; i<window.Vegebot.rosParameters.length; i++) {
				var param = window.Vegebot.rosParameters[i];
				if (param.name==name) {
					param.value = value;
					//console.log("Set " + name + " to " + value + " in dynamic callback");
					return;
				}
			}
			console.log("ERROR: Couldn't find param " + name + " in:");
			console.log(window.Vegebot.rosParameters);
		}
		window.Vegebot.setParamCallback = setParamCallback;

		function updateParametersAndSetNextTimer() {
  			window.Vegebot.updateParameterList();
  			// Update values from server every 5 seconds
			setTimeout(function() {
  				window.Vegebot.requestParameters();
  			}, 1000);			
		}

		function parameterNameToId(name) {
			var regex = /\//gi;

			return name.replace(regex, 'slash-');
		}

		function idToParameterName(id) {
			var regex = /slash-/gi;

			return id.replace(regex, '/');
		}

		function submitParameter(id, value) {
			var parameterName = idToParameterName(id);

		 	console.log("Changing parameter: " + parameterName + " to " + value);

		 	value = recastValue(value);
			var matchingParameters = window.Vegebot.rosParameters.filter(function(obj){
				console.log("*** " + obj.name);
				return obj.name == parameterName;
			});		
			if (matchingParameters.length>0) {
				console.log("Matching params:");
				console.log(matchingParameters.length);
				var param = matchingParameters[0].param;
				param.set(value);
				console.log(param);
				console.log("ROS parameter set");
				console.log("****************");
			} else {
				console.log("No matching parameter: " + parameterName);
				console.log(window.Vegebot.rosParameters);
			}	
		}
		window.Vegebot.submitParameter = submitParameter;

}

// http://stackoverflow.com/questions/5778020/check-whether-an-input-string-contains-number
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function recastValue(value) {
	value = value.trim();
	if (isNumeric(value)) value=parseFloat(value);
	if (value=="true") value=true;
	if (value=="false") value=false;
	return value;
}

function sendGenericCommand(lettuceId, command) {
	console.log("Sending Generic Command: " + command + ' to ' + lettuceId);
	var lettuceHypothesis = Lettuces[lettuceId],
		position = lettuceHypothesis.pose.position,
		x = position.x,
		y = position.y,
		z = position.z;

	sendVegebotCommand(command + ' ' + x + ' ' + y + ' ' + z);	
}

function sendPickCommand(lettuceId) {
	console.log("Sending Pick Command: " + lettuceId);
	var lettuceHypothesis = Lettuces[lettuceId],
		position = lettuceHypothesis.pose.position,
		x = position.x,
		y = position.y,
		z = position.z;

	sendVegebotCommand('pick ' + x + ' ' + y + ' ' + z);	
}

function sendNextActionCommand(lettuceId) {
	console.log("Sending Pick Command: " + lettuceId);
	var lettuceHypothesis = Lettuces[lettuceId],
		position = lettuceHypothesis.pose.position,
		x = position.x,
		y = position.y,
		z = position.z;

	sendVegebotCommand('next_action ' + x + ' ' + y + ' ' + z);	
}

function sendActionCommand(lettuceId) {
	console.log("Sending Pick Command: " + lettuceId);
	var lettuceHypothesis = Lettuces[lettuceId],
		position = lettuceHypothesis.pose.position,
		x = position.x,
		y = position.y,
		z = position.z;

	sendVegebotCommand('action ' + x + ' ' + y + ' ' + z);	
}

function sendVegebotCommand(commandString) {
	var command = new ROSLIB.Message({
		data: commandString
	});

	window.VegebotCommands.publish(command);
}

function create3DLettuce(radius, x, y, z) {
	//console.log("**** Creating 3D sphere *****");
	var geometry = new THREE.SphereGeometry( radius, 32, 32 );
	var material = new THREE.MeshLambertMaterial( {color: 0x33ff33} );
	var sphere = new THREE.Mesh( geometry, material );

	//Viewer.addObject(sphere, true);
	Viewer.scene.add(sphere);

	return sphere;
}

function update3DdisplayWithLettuceHypothesis(lettuceHypothesis) {
	//console.log('Updating 3D display with Lettuce Hypothesis: ' + lettuceHypothesis.lettuce_hypothesis_id);
//	console.log(lettuceHypothesis.model3D);
	var model3D = lettuceHypothesis.model3D;
	var radius = lettuceHypothesis.radius,
		x = lettuceHypothesis.pose.position.x,
		y = lettuceHypothesis.pose.position.y,
		z = lettuceHypothesis.pose.position.z;

	var pos = new THREE.Vector3( x, y, z );		

	model3D.position = pos;
}
window.update3DdisplayWithLettuceHypothesis = update3DdisplayWithLettuceHypothesis;


function lettuceUpdateFromViewport(lettuceHypothesis) {
	var command = new ROSLIB.Message(lettuceHypothesis);

	window.LettuceUpdatesFromViewport.publish(command);	
}
window.lettuceUpdateFromViewport = lettuceUpdateFromViewport;