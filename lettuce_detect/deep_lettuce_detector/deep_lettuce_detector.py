import numpy as np
import cv2
import os
import signal
import sys
import darknet
import shutil
import time
import datetime

TEMP_PATH = "/tmp/"
FONT = cv2.FONT_HERSHEY_SIMPLEX

# Paths should remain constant if this file is saved within darknet directory
# For localization network
cfgfile_1 = 'lettuce_cfg/yolo-lettuce.cfg'
datacfg_1 = 'lettuce_cfg/lettuceABCD.data'
weightfile_1 = 'lettuce_cfg/ABCD_7000.weights'
# For classification network
cfgfile_2 = 'lettuce_cfg/lettuce-GS1.cfg'
datacfg_2 = 'lettuce_cfg/lettuceGS1.data'
weightfile_2 = 'lettuce_cfg/lettuce-GS1_70.weights'

# Use with
# from deep_lettuce_detector import DeepLettuceDetector
# see main loop below for demo usage

class DeepLettuceDetector():
	def __init__(self):
		(self.localization_network, self.localization_meta, self.classification_network, self.classification_meta) = self.load_networks()

	def localization(self, frame):
		print
		print 'Localization'
		temp_image_path = TEMP_PATH + 'lettuce_frame.jpg' 
		cv2.imwrite(temp_image_path, frame)
		local_start = time.time()
		results = darknet.detect(self.localization_network, self.localization_meta, temp_image_path, 0.3, 0.3)
		local_end = time.time()
		print 'localization time: ' + str(local_end - local_start)
		for result in results:
			print result
		processed_results = self.to_all_res(results, frame)	
		return processed_results

	def classification(self, frame, class_res):		
		print
		print 'Classification'
		height = np.size(frame, 0)
		width = np.size(frame, 1)
		for i in range(len(class_res)):
			left = class_res[i][2][0]
			right = class_res[i][2][2]
			top = class_res[i][2][1]
			bot = class_res[i][2][3]
			box_w = right - left
			box_h = bot - top
			margin = min(top,left,height-bot,width-right)
			margin = min(int(0.1*(box_w + box_h))-1, margin)
			top_edge = int(top-margin)
			bottom_edge = int(bot+margin)
			left_edge = int(left-margin)
			right_edge = int(right+margin)
			cropped_frame = frame[top_edge:bottom_edge,left_edge:right_edge]
			cropped_path = self.def_path(TEMP_PATH,i)
			cv2.imwrite(cropped_path, cropped_frame)
			#cv2.imwrite(cropped_path, frame)
			im = darknet.load_image(cropped_path,0,0)
			r_classify = darknet.classify(self.classification_network, self.classification_meta, im)
			class_res[i][0] = r_classify[0][0]
		for result in class_res:
			print result	
		return class_res

	def load_networks(self):
		print "Loading Localization Network weights..."
		net_1 = darknet.load_net(cfgfile_1, weightfile_1, 0)
		print 'Loading Localization Network data...'
		meta_1 = darknet.load_meta(datacfg_1)
		print "Loading Classification Network weights..."
		net_2 = darknet.load_net(cfgfile_2, weightfile_2, 0)
		print "Loading Classification Network weights..."
		meta_2 = darknet.load_meta(datacfg_2)
		return (net_1, meta_1, net_2, meta_2)

	def def_path(self, path, img_count):
		img_name = str(img_count).zfill(5) +'.jpg'
		return path + img_name

	# The function takes raw localization output from YOLO
	# Convert the output (r) to a more readable format(all_res)
	# Also reject the bounding boxes that are on the edge
	def to_all_res(self, r, frame):
		h = np.size(frame, 0)
		w = np.size(frame, 1)

		margin = float(w+h)/75
		all_res = []
		for i in range(len(r)):
			if_valid = 0
			res = list(r[i])
			res_cord = list(res[2])
			left = int(float(r[i][2][0]) - float(r[i][2][2])/2)
			top = int(float(r[i][2][1]) - float(r[i][2][3])/2)
			right = int(float(r[i][2][0]) + float(r[i][2][2])/2)
			bot = int(float(r[i][2][1]) + float(r[i][2][3])/2)
			offset = 0
			if left < 0:      offset = -left
			if (top < 0):     offset = max(offset, -top)
			if (right > w-1): offset = max(offset, right+1-w)
			if (bot > h-1):   offset = max(offset, bot+1-h)
			if offset > 0:
				left = left + offset
				top = top + offset
				bot = bot - offset
				right = right - offset
			if (top >= bot) or (left >= right): res[0] = 'Rejected'

			if (left < margin) or (right > w-margin): if_valid = if_valid + 1
			if (top < margin) or (bot > h-margin): if_valid = if_valid + 1
			box_w = float(right - left)
			box_h = float(bot - top)
			if (box_h == 0 or (box_w/box_h) > 1.4 or (box_w/box_h) < 0.71):
				res[0] = 'Rejected'
			elif ((box_w/box_h) > 1.15 or (box_w/box_h) < 0.84):
				if_valid = if_valid + 1
			if if_valid >= 2:
				res[0] = 'Rejected'
			res_cord = [left, top, right, bot]
			res[2] = res_cord
			all_res.append(res)
		return all_res
	

# Demo code: only necessary for running module from the command line e.g.
# python2 deep_lettuce_detector.py
# This opens a capture window and performs lettuce detection

def set_up_capture_demo():
	cap = cv2.VideoCapture(0)
	cv2.namedWindow("deep_lettuce_detector", 0)
	return cap		

def capture_frame():
	ret, frame = cap.read()
	display_frame(frame)
	return frame	

def display_frame(frame):	
	cv2.imshow("deep_lettuce_detector",frame)

def	tear_down_demo(cap):
	cap.release()
	cv2.destroyAllWindows()	

def draw_boxes(frame, all_res):
	print
	print('Draw boxes')
	img = frame.copy()
	for res in all_res:
		left = res[2][0]
		right = res[2][2]
		top = res[2][1]
		bot = res[2][3]
		if res[0] == 'Good' or res[0] == 'Lettuce':
			cv2.rectangle(img,(left,top),(right,bot),(255,0,0),4)
		else:
			cv2.rectangle(img,(left,top),(right,bot),(0,255,0),4)			
	return img

def draw_classes(img, all_res):
	img_cur = img.copy()
	for res in all_res:
		cv2.putText(img_cur,res[0] + ' ' + str(res[1])[:5],(int(res[2][0]),int(res[2][1])), FONT, 0.5,(255,255,255))
	return img_cur	

if __name__ == '__main__':
	print "Demo of deep_lettuce_detector"
	cap = set_up_capture_demo()

	detector = DeepLettuceDetector()

	frame = capture_frame()
	results = detector.localization(frame)
	class_res = detector.classification(frame, results)
	img = draw_boxes(frame, class_res)
	img = draw_classes(img, class_res)
	display_frame(img)

	key = cv2.waitKey(0) & 0xFF

	tear_down_demo(cap)

	print "executed deep_lettuce_detector"