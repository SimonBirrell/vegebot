# vegebot
Repository for all Vegebot code
by Simon Birrell

Includes the following packages:
vegebot - The metapackage
vegebot_commander - Overall executive for Vegebot
vegebot_msgs - Definition of vegebot-specific messages for ROS topics.
vegebot_run - Startup scripts and robot URDFs
vegebot_webserver - Drives the Vegebot HTML UI.
lettuce_test - Various test scripts that simulate lettuces.

(c) Bio-inspired Robotics Laboratory, Cambridge University. 2017. All Rights Reserved.

INSTALLATION
============

1. Install ROS Kinetic
2. Create Catkin Workspace http://wiki.ros.org/catkin/Tutorials/create_a_workspace
3. Install vegebot software
```
cd ~/catkin_ws_src
git clone https://github.com/manacoa/vegebot
cd ~/catkin_ws
```
6. Install other packages
```
sudo apt-get install ros-kinetic-web-video-server
sudo apt-get install ros-kinetic-ur10-moveit-config
sudo apt-get install ros-kinetic-ur-gazebo
``` 
7. catkin_make
```
cd ~/catkin_ws
catkin_make
```
8. Add commands to BASH shell
```
echo "source ~/catkin_ws/devel/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

DEMO
====

REAL ROBOT

1. Connect to UR-10 via ethernet and check you can ping UR-10 at 192.168.2.5
2. On UR-10 touch screen, go to Program Robot > Move > Home and press Auto until robot in upright position
3. Leave the Home screen (important!)
4. In first terminal window do roslaunch vegebot_run run.launch
5. In second window do rosrun vegebot?commander vegebot_commander
6. Open browser to http://localhost:8000 Model should load.
7. Click Detect for fixed lettuces
8. Click Pick on any lettuce
9. Click Camera Image to read an image off disk and extract lettuces
10. Can use rosrun image_view image_view image:=/vegebot/lettuce_hypotheses/annotated_images to monitor image

SIMULATION

1. In first terminal window do roslaunch vegebot_run sim.launch
2. In second window do rosrun vegebot?commander vegebot_commander
3. Open browser to http://localhost:8000 Model should load.
4. Click Detect for fixed lettuces
5. Click Pick on any lettuce
6. Click Camera Image to read an image off disk and extract lettuces
7. Can use rosrun image_view image_view image:=/vegebot/lettuce_hypotheses/annotated_images to monitor image

