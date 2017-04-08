#!/usr/bin/env python

import rospy
import numpy as np
import cv2
from geometry_msgs.msg import Pose

KEY_ESC = 27
KEY_P = 112
KEY_R = 114
KEY_C = 99
KEY_Q = 113

# Distance in metres
CAMERA_HEIGHT_ABOVE_GROUND = 1.0
X_CAMERA_CENTRE_FROM_ORIGIN = 1.0
Y_CAMERA_CENTRE_FROM_ORIGIN = 0.0
Z_CAMERA_CENTRE_FROM_ORIGIN = 1.0

Publisher = None

def detect_lettuce():
	# Webcam 0 is Logitech 1 iSight
	#cap = cv2.VideoCapture(0)
	cap = cv2.VideoCapture('/home/simonbirrell/catkin_ws/src/vegebot/lettuce_prey/nodes/lettuces.mp4')
	global Publisher
	Publisher = rospy.Publisher('lettuce_target', Pose, queue_size=10)
	rospy.init_node('lettuce_prey', anonymous=True)

	while True:
		key, lettuces = scan_video(cap)
		key = handle_lettuce_list(lettuces, key)
		if (key==KEY_ESC):
			print("User interrupted scan")
			break
		elif (key==KEY_Q):
			print("User asked to quit")
			break

	cap.release()
	cv2.destroyAllWindows()

def get_valid_key():
	while True:
		k = cv2.waitKey(30) & 0xff
		if k in [KEY_ESC, KEY_P, KEY_R, KEY_C, KEY_Q]:
			break
	return k		

def handle_lettuce_list(lettuces, key_pressed):
	attempted_lettuces = []
	while True:
		if (key_pressed==KEY_P):
			print("User asked to pick")
			print("%s lettuces found" % len(lettuces))
			best_lettuce = pick_best_lettuce(lettuces, attempted_lettuces)
			if best_lettuce != None:
				print("Best lettuce found:")
				print(best_lettuce)
				attempted_lettuces.append(best_lettuce)
				publish_lettuce(best_lettuce)
			else:
				print("No more lettuces found. Restarting scan...")
				break
		elif (key_pressed==KEY_R):
			print("Resetting")
			break
		elif (key_pressed==KEY_C):
			print("Calibrating")
			break
		elif (key_pressed==KEY_Q):
			print("Exiting")
			break	
		key_pressed = get_valid_key()
	return key_pressed	

def publish_lettuce(lettuce):
	global Publisher
	print ("PUBLISHED LETTUCE")
	print(lettuce)
	pose = lettuce_to_pose(lettuce)
	Publisher.publish(pose)

def lettuce_to_pose(lettuce):
	pose = Pose()
	pose.position.x = X_CAMERA_CENTRE_FROM_ORIGIN
	pose.position.y = Y_CAMERA_CENTRE_FROM_ORIGIN
	pose.position.z = Z_CAMERA_CENTRE_FROM_ORIGIN - CAMERA_HEIGHT_ABOVE_GROUND
	pose.orientation.x = 0.7071067811865476
	pose.orientation.y = 0.0
	pose.orientation.z = 0.0
	pose.orientation.w = 0.7071067811865476
	return pose	

def pick_best_lettuce(lettuces, attempted_lettuces):
	for lettuce in lettuces:
		if not(lettuce_already_attempted(lettuce, attempted_lettuces)):
			return lettuce	
	return None		

def lettuce_already_attempted(lettuce, attempted_lettuces):
	for already_attempted_lettuce in attempted_lettuces:
		if np.array_equal(already_attempted_lettuce, lettuce):
			return True
	return False

def scan_video(cap):
	lettuce_cascade = cv2.CascadeClassifier('/home/simonbirrell/catkin_ws/src/vegebot/lettuce_prey/nodes/data/cascade.xml')

	while 1:
	    ret, img = cap.read()
	    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
	    #lettuces = lettuce_cascade.detectMultiScale(gray, 1.3, 5)
	    lettuces = lettuce_cascade.detectMultiScale(gray, 1.3, 5, minSize=(150,150), maxSize=(250,250))

	    for (x,y,w,h) in lettuces:
	        cv2.rectangle(img,(x,y),(x+w,y+h),(255,0,0),2)

	    cv2.imshow('img',img)
	    k = cv2.waitKey(30) & 0xff
	    if k in [KEY_ESC, KEY_P, KEY_R, KEY_C, KEY_Q]:
	        break
	return k, lettuces	        

if __name__ == '__main__':
	print "Detecting green stuff..."
	detect_lettuce()

