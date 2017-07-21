# vegebot

Meta-package for VEGEBOT project. Depends on vegebot_run which depends on everything else.

(c) Simon Birrell 2016-2017. All Rights Reserved.

Installation Issues on Kinetic
------------------------------

1. MoveIt Plugin issue
In file universal_robot/ur_kinematics/include/ur_kinematics/ur_moveit_plugin.h
replace line 89
#include <moveit_msgs/GetKinematicSolverInfo.h>
with
#include <moveit_msgs/KinematicSolverInfo.h>

2. MoveIt Commander ImportError: cannot import name structs
https://github.com/ros-planning/moveit/issues/86
sudo pip uninstall pyassimp
sudo pip install pyassimp



