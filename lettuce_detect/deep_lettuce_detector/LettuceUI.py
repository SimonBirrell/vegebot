import numpy as np
import cv2
import os
import darknet
import LettuceUI_support as UI
import shutil
import time
import datetime

# images and results will be saved to this path
PATH = '/home/birl/Desktop/UIdata/'
# For localization network
datacfg_1 = 'lettuce_cfg/lettuce-localization.data'
cfgfile_1 = 'lettuce_cfg/lettuce-localization.cfg'
weightfile_1 = 'lettuce_cfg/lettuce-localization.weights'
# For classification network
datacfg_2 = 'lettuce_cfg/lettuce-classification.data'
cfgfile_2 = 'lettuce_cfg/lettuce-classification.cfg'
weightfile_2 = 'lettuce_cfg/lettuce-classification.weights'

############ SELECT CLASSES #################

def select_class(img, res):
	class_index = 0
	res1 = list(res)
	while (True):
		key = cv2.waitKey(0) & 0xFF
		# q for exit the current mode
		# w for the previous class
		# d for the next class
		# ENTER to confirm the class selection
		if key == ord('\n'):
			cv2.imshow(UI.WINNAME,img)
			res1[0] = UI.CLASS_LABEL[class_index]
			return res1
		elif key == ord('q'):
			return res
		elif key == ord('w'): #Up
			class_index = class_index - 1			
			if class_index == -1:
				class_index = len(UI.CLASS_LABEL)-1		
			img_new = img.copy()
			cv2.putText(img_new,UI.CLASS_LABEL[class_index],(int(res[2][0]),int(res1[2][3])), UI.FONT, 0.5,(255,255,255))
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord('s'): #Down
			class_index = class_index + 1
			if class_index == len(UI.CLASS_LABEL):
				class_index = 0
			img_new = img.copy()
			cv2.putText(img_new,UI.CLASS_LABEL[class_index],(int(res1[2][0]),int(res1[2][3])), UI.FONT, 0.5,(255,255,255))
			cv2.imshow(UI.WINNAME,img_new)

############ ADJUST BOXES #################

def adjust_boxes(img_cur, res):
	res1 = list(res)
	center_x = (res1[2][0] + res1[2][2])/2
	center_y = (res1[2][1] + res1[2][3])/2
	radius = (res1[2][2]-res1[2][0]+res1[2][3]-res1[2][1])/4
	res1_cord = [center_x - radius, center_y - radius, center_x + radius, center_y + radius]
	while True:
		key = cv2.waitKey(0) & 0xFF
		if key == ord('\n'):
			res1[2] = res1_cord
			return res1
		elif key == ord('q'): #exit
			return res
		elif key == ord('a'): #move left
			res1_cord[0] = res1_cord[0] - 2
			res1_cord[2] = res1_cord[2] - 2	
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(res1_cord[0],res1_cord[1]),(res1_cord[2],res1_cord[3]),(255,255,255),4)
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord('d'): #move right
			res1_cord[0] = res1_cord[0] + 2
			res1_cord[2] = res1_cord[2] + 2	
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(res1_cord[0],res1_cord[1]),(res1_cord[2],res1_cord[3]),(255,255,255),4)
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord('w'): #move up
			res1_cord[1] = res1_cord[1] - 2
			res1_cord[3] = res1_cord[3] - 2	
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(res1_cord[0],res1_cord[1]),(res1_cord[2],res1_cord[3]),(255,255,255),4)
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord('s'): #move down
			res1_cord[1] = res1_cord[1] + 2
			res1_cord[3] = res1_cord[3] + 2	
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(res1_cord[0],res1_cord[1]),(res1_cord[2],res1_cord[3]),(255,255,255),4)
			cv2.imshow(UI.WINNAME,img_new)		
		elif key == ord('-'): #shrink
			res1_cord[0] = res1_cord[0] + 1
			res1_cord[2] = res1_cord[2] - 1	
			res1_cord[1] = res1_cord[1] + 1
			res1_cord[3] = res1_cord[3] - 1	
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(res1_cord[0],res1_cord[1]),(res1_cord[2],res1_cord[3]),(255,255,255),4)
			cv2.imshow(UI.WINNAME,img_new)	
		elif key == ord('='): #expand
			res1_cord[0] = res1_cord[0] - 2
			res1_cord[2] = res1_cord[2] + 2	
			res1_cord[1] = res1_cord[1] - 2
			res1_cord[3] = res1_cord[3] + 2	
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(res1_cord[0],res1_cord[1]),(res1_cord[2],res1_cord[3]),(255,255,255),4)
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord('m'): #switch between 'Lettuce' or 'Rejected'
			if res1[0] == 'Lettuce': res1[0] = 'Rejected'
			else: res1[0] = 'Lettuce'		
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(res1_cord[0],res1_cord[1]),(res1_cord[2],res1_cord[3]),(255,255,255),4)
			cv2.putText(img_new,res1[0],(int(res1[2][0]),int(res1[2][3])), UI.FONT, 0.5,(255,255,255))
			cv2.imshow(UI.WINNAME,img_new)

############ CLASSIFICATION #################
def classification(frame, class_res,net_2,meta_2,temp_path):
	if os.path.exists(temp_path): 
		shutil.rmtree(temp_path)
	os.makedirs(temp_path)
	
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
		
		cropped_frame = frame[top-margin:bot+margin,left-margin:right+margin]
		cropped_path = UI.def_path(temp_path,i)
		cv2.imwrite(cropped_path, cropped_frame)
		im = darknet.load_image(cropped_path,0,0)
		r_classify = darknet.classify(net_2, meta_2, im)
		class_res[i][0] = r_classify[0][0]
	return class_res
		
############ SELECT LETTUCE #################
# q for exiting the current mode
# a for moving to the previous lettuce
# d for moving to the next lettuce
# SPACE to select the lettuce
# ENTER to save and exit

def classification_window(img_path,frame,valid_res,net_2,meta_2):
	temp_path = PATH + 'Temp/'
	class_res = list(valid_res)
	height = np.size(frame, 0)
	width = np.size(frame, 1)
	class_start = time.time()
	class_res = classification(frame, class_res, net_2, meta_2, temp_path)
	class_end = time.time()
	print 'classification time:' + str(class_end - class_start)
	UI.print_res('After classification ', class_res)
	img = UI.draw_boxes(frame, class_res)
	img_cur = UI.draw_classes(img, class_res)
	img_new = img_cur.copy()

	total_lettuce = len(class_res)
	count = 0

	cv2.rectangle(img_new,(int(class_res[count][2][0]),int(class_res[count][2][1])),\
					(int(class_res[count][2][2]),int(class_res[count][2][3])),(255,255,255),2)
	cv2.imshow(UI.WINNAME,img_new)

	while (True):
		key = cv2.waitKey(0) & 0xFF
		if key == ord('\n'):
			if UI.warning_window(img_cur, 'Next image?\n')==False: 
				cv2.imshow(UI.WINNAME,img_new)
				continue
			cv2.imwrite(img_path.replace('.jpg','_detection.png'), img_cur)
			shutil.rmtree(temp_path)
			UI.save_img(frame, class_res, PATH)
			return class_res
		elif key == ord('q'):
			shutil.rmtree(temp_path)
			return False
		elif key == ord('a'): #Left
			if count == 0:
				count = total_lettuce-1
			else:
				count = count - 1
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(int(class_res[count][2][0]),int(class_res[count][2][1])),\
					(int(class_res[count][2][2]),int(class_res[count][2][3])),(255,255,255),2)
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord('d'): #Right
			if count == total_lettuce-1:
				count = 0
			else:
				count = count + 1
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(int(class_res[count][2][0]),int(class_res[count][2][1])),\
					(int(class_res[count][2][2]),int(class_res[count][2][3])),(255,255,255),2)
			cv2.imshow(UI.WINNAME,img_new)			
		elif key == ord(' '):
			cv2.rectangle(img_new,(int(class_res[count][2][0]),int(class_res[count][2][1])),\
					(int(class_res[count][2][2]),int(class_res[count][2][3])),(255,255,255),4)
			cv2.imshow(UI.WINNAME,img_new)
			class_res[count] = tuple(select_class(img_new, list(class_res[count])))
			img = UI.draw_boxes(frame, class_res)	
			img_cur = UI.draw_classes(img, class_res)
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(int(class_res[count][2][0]),int(class_res[count][2][1])),\
					(int(class_res[count][2][2]),int(class_res[count][2][3])),(255,255,255),2)
			cv2.imshow(UI.WINNAME,img_new)
		else:
			continue

############ SELECT LETTUCE #################
# q for exiting the current mode
# a for moving to the previous lettuce
# d for moving to the next lettuce
# SPACE to select a lettuce
# ENTER to save and start classification
# = for adding a new lettuce

def localization_window(img_path, frame, r):
	height = np.size(frame, 0)
	width = np.size(frame, 1)
	cv2.imshow(UI.WINNAME,frame)

	if len(r) == 0:
		cv2.putText(frame,'Cannot see any lettuces. Press q to continue',(100,100), UI.FONT, 0.5,(255,255,255))
		cv2.imshow(UI.WINNAME, frame)
		while (True):
			if cv2.waitKey(0) & 0xFF == ord('q'): return ([],False)

	ori_res = UI.to_all_res(r,height,width)
	all_res = list(ori_res)
	img = UI.draw_boxes(frame, all_res)

	total_lettuce = len(all_res)
	count = 0
	img_cur = UI.draw_classes(img, all_res)
	img_new = img_cur.copy()
	cv2.rectangle(img_new,(int(all_res[count][2][0]),int(all_res[count][2][1])),\
					(int(all_res[count][2][2]),int(all_res[count][2][3])),(255,255,255),2)
	cv2.imshow(UI.WINNAME,img_new)

	while (True):
		key = cv2.waitKey(0) & 0xFF
		if key == ord('\n'): #Save current results and continue to classification 
			if UI.warning_window(img_cur, 'Classification window?\n')==False: continue
			cv2.imwrite(img_path.replace('.jpg','.png'), img_cur)
			print 'image saved to path: ' + img_path
			UI.write_file(img_path.replace('.jpg','.txt'), all_res, width, height)
			results_file = PATH + 'results.txt'
			return (ori_res, all_res)
		elif key == ord('q'): #Exit
			os.remove(img_path)
			return (ori_res, False)
		elif key == ord('a'): #Left
			if count == 0:
				count = total_lettuce-1
			else:
				count = count - 1
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(int(all_res[count][2][0]),int(all_res[count][2][1])),\
					(int(all_res[count][2][2]),int(all_res[count][2][3])),(255,255,255),2)
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord('d'): #Right
			if count == total_lettuce-1:
				count = 0
			else:
				count = count + 1
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(int(all_res[count][2][0]),int(all_res[count][2][1])),\
					(int(all_res[count][2][2]),int(all_res[count][2][3])),(255,255,255),2)
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord('='): #Add a new bounding box
			all_res.append(['Lettuce', 1, [width/2-50,height/2-50,width/2+50,height/2+50]])
			total_lettuce = len(all_res)
			img = UI.draw_boxes(frame, all_res)	
			img_cur = UI.draw_classes(img, all_res)
			count = total_lettuce-1
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(int(all_res[count][2][0]),int(all_res[count][2][1])),\
					(int(all_res[count][2][2]),int(all_res[count][2][3])),(255,255,255),2)
			cv2.imshow(UI.WINNAME,img_new)
		elif key == ord(' '): #Select a bounding box to adjust
			cv2.rectangle(img_new,(int(all_res[count][2][0]),int(all_res[count][2][1])),\
					(int(all_res[count][2][2]),int(all_res[count][2][3])),(255,255,255),4)
			cv2.imshow(UI.WINNAME,img_new)
			all_res[count] = adjust_boxes(img_cur, list(all_res[count]))
			img = UI.draw_boxes(frame, all_res)	
			img_cur = UI.draw_classes(img, all_res)
			img_new = img_cur.copy()
			cv2.rectangle(img_new,(int(all_res[count][2][0]),int(all_res[count][2][1])),\
					(int(all_res[count][2][2]),int(all_res[count][2][3])),(255,255,255),2)
			cv2.imshow(UI.WINNAME,img_new)
		else:
			continue

################ MAIN LOOP ######################
cap = cv2.VideoCapture(0)
img_count = 1
PATH = PATH + datetime.datetime.now().strftime("%Y-%m-%d_%H:%M") + '/'
UI.create_folders(PATH)

net_1 = darknet.load_net(cfgfile_1, weightfile_1, 0)
meta_1 = darknet.load_meta(datacfg_1)
net_2 = darknet.load_net(cfgfile_2, weightfile_2, 0)
meta_2 = darknet.load_meta(datacfg_2)

localization_PR = np.array([0,0,0])
classification_PR = np.zeros((4,4))

while(True):
	ret, frame = cap.read()
	cv2.namedWindow(UI.WINNAME, 0)
	cv2.imshow(UI.WINNAME,frame)

	key = cv2.waitKey(1) & 0xFF
	if key == ord('\n'):
		print 'Processing image ' + str(img_count)
		img_path = UI.def_path(PATH, img_count)

		if UI.freeze_frame():
			cv2.imwrite(img_path, frame)
			local_start = time.time()
			# return predicted results
			r = darknet.detect(net_1, meta_1, img_path, 0.3, 0.3)
			local_end = time.time()
			print 'localization time: ' + str(local_end - local_start)
			UI.print_res('raw results', r)

			# return predicted and corrected results
			(ori_res, all_res) = localization_window(img_path,frame,r)
			if all_res == False: continue
			UI.print_res('all_res', all_res)
			img_count = img_count+1
			localization_PR = localization_PR + UI.boxes_PR(ori_res,all_res)
			print 'Localization [TP,FP,FN]: ' + str(localization_PR)
			
			# only keep the valid bounding boxes for classification
			valid_res = UI.to_valid_res(all_res)
			UI.print_res('valid_res', valid_res)

			# return the confusion matrix for classification
			class_res = classification_window(img_path,frame,valid_res,net_2,meta_2)
			if class_res == False: continue
			UI.print_res('class_res', class_res)
			classification_PR = classification_PR + UI.classification_PR(valid_res, class_res)
			print'classification: \n' + str(classification_PR)
	elif key == ord('q'):	break	

print '\nFINAL RESULTS: \nTotal pictures: ' + str(img_count)
print 'Localization [TP,FP,FN] \n: ' + str(localization_PR) 
print 'classification: \n' + str(classification_PR)

# When everything done, release the capture
cap.release()
cv2.destroyAllWindows()
