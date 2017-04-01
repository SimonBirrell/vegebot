# vegebot_run

Package that contains run scripts for Vegebot. Includes dependencies for all sub-packages.

Testing the real UR/10
----------------------

ping 192.168.2.12
to make sure robot connected.

roslaunch ur_modern_driver ur10_bringup.launch robot_ip:=192.168.2.12
rosrun ur_modern_driver test_move.py


(c) Simon Birrell 2016-2017. All Rights Reserved.
