cmake_minimum_required(VERSION 2.8.3)
project(vegebot_msgs)

## Find catkin macros and libraries
## if COMPONENTS list like find_package(catkin REQUIRED COMPONENTS xyz)
## is used, also find other catkin packages
find_package(catkin REQUIRED COMPONENTS message_generation std_msgs geometry_msgs)


## Generate messages in the 'msg' folder
add_message_files(
   FILES
   LettuceHypothesis.msg
)

## Generate services in the 'srv' folder
#add_service_files(
#   FILES
#   SetPayload.srv
#   SetIO.srv
#)


## Generate added messages and services with any dependencies listed here
generate_messages(
   DEPENDENCIES
   std_msgs
   geometry_msgs
)

###################################
## catkin specific configuration ##
###################################
catkin_package(
#  INCLUDE_DIRS include
#  LIBRARIES vegebot_msgs
   CATKIN_DEPENDS message_runtime std_msgs geometry_msgs
#  DEPENDS system_lib
)

###########
## Build ##
###########

#############
## Install ##
#############

#############
## Testing ##
#############
