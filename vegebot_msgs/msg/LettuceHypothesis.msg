# Message describing a Lettuce Hypothesis, i.e. our guess
# of a lettuce being present at a particular location

string lettuce_hypothesis_id	# GUID that uniquely identifies this hypothesis
string label					# Defined by Object Detection, e.g. 'healthy lettuce'
geometry_msgs/Pose pose   		# Lettuce pose. Orientation largely irrelevant
float64 radius					# Radius of supposed lettuce, in metres
float64 probability				# Probability that the lettuce actually exists as described
float64 camera_bb_x				# Centre of lettuce bounding box on video image (pixels)
float64 camera_bb_y				# Centre of lettuce bounding box on video image (pixels)
float64 camera_bb_width			# Width of lettuce bounding box on video image (pixels)
float64 camera_bb_height		# Height of lettuce bounding box on video image (pixels)

