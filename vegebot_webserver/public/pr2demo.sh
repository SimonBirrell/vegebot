roscore &
sleep 10
roslaunch pr2_description upload_pr2.launch &
rosrun robot_state_publisher robot_state_publisher &
rosparam set use_gui true
rosrun joint_state_publisher joint_state_publisher &
rosrun tf2_web_republisher tf2_web_republisher &
roslaunch rosbridge_server rosbridge_websocket.launch 

