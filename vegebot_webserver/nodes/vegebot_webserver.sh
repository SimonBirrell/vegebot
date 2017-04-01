#!/bin/bash

echo "Launching webserver to drive Web UI"
source ~/catkin_ws/devel/setup.bash
roscd vegebot_webserver
cd public
pwd
python -m SimpleHTTPServer


