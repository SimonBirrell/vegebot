// ROS JS code for rendering 3D view and intyeracting with messages

	window.Vegebot = window.Vegebot || {};

	var Lettuces = {};
	window.Lettuces = Lettuces;

	var LettuceList = [];
	window.LettuceList = LettuceList;

	var Viewer;

	function init() {

		initVegebotUI();
		console.log('Initializing Vegeboit ROS...');
		
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

		var viewer = new ROS3D.Viewer({
			divID: 'urdf',
			width: 400,
			height: 250,
			//width: 800,
			//height: 500,
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
		console.log("Set up listener 2...");
		console.log(lettuceHypothesesTopic);

		lettuceHypothesesTopic.subscribe(
			receiveLettuceHypothesis
		);

		// Receive an array of Lettuce Hypotheses
		// Display them in 3D and add or remove from menu

		function receiveLettuceHypothesis(lettuceHypothesis) {
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
				Lettuces[lettuce_hypothesis_id] = lettuceHypothesis;
				LettuceList.push(lettuceHypothesis);
			}

			lettuceHypothesis = Lettuces[lettuce_hypothesis_id]; 
			update3DdisplayWithLettuceHypothesis(lettuceHypothesis);
			window.Vegebot.update2DUIWithLettuceHypothesis(lettuceHypothesis);
			//console.log("Now tracking " + Object.keys(Lettuces).length + " lettuces.")
		}

		function eraseLettuces() {
			var lettuceLength = LettuceList.length;
			for (var i=lettuceLength-1; i>= 0; i--) {
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
			Lettuces = {};
			LettuceList = [];
			update2DUIWithLettuceHypothesis(0);
		}

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

function sendVegebotCommand(commandString) {
	var command = new ROSLIB.Message({
		data: commandString
	});

	window.VegebotCommands.publish(command);
}

function create3DLettuce(radius, x, y, z) {
	console.log("**** Creating 3D sphere *****");
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

