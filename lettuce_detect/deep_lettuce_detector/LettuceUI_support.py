import numpy as np
import cv2
import os
import darknet

WINNAME = 'lettuceUI'
FONT = cv2.FONT_HERSHEY_SIMPLEX
CLASS_LABEL = ['Good','Immature','Infected','Background']

############## SOME FUNCTIONS #################

def def_path(path, img_count):
	img_name = str(img_count).zfill(5) +'.jpg'
	return path + img_name

# create folders for current run
def create_folders(path):
	if os.path.exists(path): 
		path = path + '_1'
	os.makedirs(path)
	for class_name in CLASS_LABEL:
		os.makedirs(path + class_name)

def print_res(name, results):
	print name + ':'
	for result in results:
		print result

def freeze_frame():
	while (True):
		key = cv2.waitKey(0) & 0xFF
		if key == ord('q'):
			return False
		elif key == ord('\n'):
			return True
		else:
			continue

# Takes the predicted and corrected localization results
# Output the number of TP, FP and FN
def boxes_PR(ori_res,all_res):
	TP = 0
	FP = 0
	FN = 0
	Positives = 0
	for i in range(len(ori_res)):
		if ori_res[i][0] == 'Rejected': 
			if all_res[i][0] == 'Lettuce': FN += 1
			continue
		if all_res[i][0] == 'Rejected':
			FP += 1
			continue
		true_center = [(all_res[i][2][0]+all_res[i][2][2])/2,(all_res[i][2][1]+all_res[i][2][3])/2]
		thres = ((all_res[i][2][2]-all_res[i][2][0]+all_res[i][2][3]-all_res[i][2][1])/20.0)**2
		predicted_center = [(ori_res[i][2][0]+ori_res[i][2][2])/2,(ori_res[i][2][1]+ori_res[i][2][3])/2]
		dist_2 = np.sum((np.asarray(true_center)-np.asarray(predicted_center))**2)
		if dist_2 < thres:	TP += 1
		else:
			FP += 1
			FN += 1
	FN = FN + len(all_res) - len(ori_res)
	print 'current [TP,FP,FN]: ' + str(np.array([TP,FP,FN])	)				
	return np.array([TP,FP,FN])

# Takes the predicted and corrected classification results
# Output a confusion matrix
def classification_PR(valid_res, class_res):
	PR = np.zeros((4,4))
	for i in range(len(valid_res)):
		pred_class = class_to_index(valid_res[i][0])
		true_class = class_to_index(class_res[i][0])
		PR[pred_class][true_class] += 1
	print 'current: \n' + str(PR)
	return PR

def class_to_index(lettuce_class):
	for i in range(len(CLASS_LABEL)):
		if lettuce_class == CLASS_LABEL[i]:
			return i
	print 'error matching lettuce class ' + lettuce_class
	return False
	
def draw_classes(img, all_res):
	img_cur = img.copy()
	for res in all_res:
		cv2.putText(img_cur,res[0] + ' ' + str(res[1])[:5],(int(res[2][0]),int(res[2][1])), FONT, 0.5,(255,255,255))
	return img_cur

# Save the corrected localization results in YOLO format
def write_file(file_name, all_res, width, height):
	f = open(file_name,'w+')
	for res in all_res:
		if res[0] != 'Rejected':
			res_x = 1.0*(res[2][0] + res[2][2])/(2*width)
			res_y = 1.0*(res[2][1] + res[2][3])/(2*height)
			res_w = 1.0*(res[2][2] - res[2][0])/width
			res_h = 1.0*(res[2][3] - res[2][1])/height			
			f.write('0' + ' ' + str(res_x) + ' ' +\
				str(res_y) + ' ' + str(res_w) + ' ' + str(res_h) + '\n')
	return
 
# Cropped out the bounding boxes after classification and 
# save the images to the corresponding folders
def save_img(frame, class_res, path):
	height = np.size(frame, 0)
	width = np.size(frame, 1)
	for res in class_res:
		left = res[2][0]
		right = res[2][2]
		top = res[2][1]
		bot = res[2][3]
		box_w = right - left
		box_h = bot - top
		margin = min(top,left,height-bot,width-right)
		margin = min(int(0.1*(box_w + box_h))-1, margin)
		cropped_frame = frame[top-margin:bot+margin,left-margin:right+margin]
		folder_path = path + res[0] + '/'
		exist_img_count = len(os.listdir(folder_path))
		cropped_path = folder_path + str(exist_img_count+1) + '_' + res[0] + '.jpg'
		cv2.imwrite(cropped_path, cropped_frame)

def draw_boxes(frame, all_res):
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

def warning_window(img_cur, message):
	img_warning = img_cur.copy()
	warning_message = message + 'Press ENTER to confirm, q to cancel'
	cv2.putText(img_warning,warning_message,(50,50), FONT, 0.5,(255,255,255))
	cv2.imshow(WINNAME,img_warning)
	while (True):
		key = cv2.waitKey(1) & 0xFF
		if key == ord('q'):
			return False
		elif key == ord('\n'):
			return True
		else:
			continue
	
# Only keep the valid bounding boxes
# Ignore the "Rejected"
def to_valid_res(all_res):
	valid_res = []
	for res in all_res:
		if res[0] == 'Lettuce':
			valid_res.append(res)
	return valid_res

# The function takes raw localization output from YOLO
# Convert the output (r) to a more readable format(all_res)
# Also reject the bounding boxes that are on the edge
def to_all_res(r,h,w):
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
	
