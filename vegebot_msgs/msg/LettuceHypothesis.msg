# Message describing a Lettuce Hypothesis, i.e. our guess
# of a lettuce being present at a particular location

string lettuce_hypothesis_id	# GUID that uniquely identifies this hypothesis
string label					# Defined by Object Detection, e.g. 'healthy lettuce'
geometry_msgs/Pose pose   		# Lettuce pose. Orientation largely irrelevant
float64 radius					# Radius of supposed lettuce, in metres
float64 probability				# Probability that the lettuce actually exists as described

