import numpy

def intersection_vector_and_plane(vector, plane_points):
    # xa, ya, za = end of vector. xb, yb, zb = origin
    matrix = numpy.array([[vector[0], plane_points[1][0]-plane_points[0][0], plane_points[2][0]-plane_points[0][0]],
                          [vector[1], plane_points[1][1]-plane_points[0][1], plane_points[2][1]-plane_points[0][1]],
                          [vector[2], plane_points[1][2]-plane_points[0][2], plane_points[2][2]-plane_points[0][2]]])
    print("matrix 1")
    print(matrix)
    try:
        inverse = numpy.linalg.inv(matrix)
    except numpy.linalg.LinAlgError:
        # Not invertible. Skip this one.
        rospy.loginfo("**** ERROR ****: Couldnt invert matrix in intersection_vector_and_plane().") 
        quit()   
    print("inverse")
    print(inverse)    
    matrix2 = numpy.array( [[vector[0] - plane_points[0][0]],
                            [vector[1] - plane_points[0][1]],
                            [vector[2] - plane_points[0][2]]])
    print("matrix2")
    print(matrix2)
    result = numpy.matmul(inverse, matrix2)
    print("result")
    print(result)
    t = result[0]
    print("t ", t)
    intersection = vector * (1 - t)
    return intersection

if __name__ == '__main__':
    print("test 1 - should be 0.0, 0.0, 0.0")
    intersection = intersection_vector_and_plane((1.0, 1.0, 1.0), ((0.0, 0.0, 0.0), (10.0, 10.0, 0.0), (-10.0, 5.0, 0.0)))
    print("----------")
    print(intersection)
    print
    print("test 2 - should be 4.0, 0.0, -4.0")
    intersection = intersection_vector_and_plane((1.0, 0.0, -1.0), ((0.0, 0.0, -4.0), (10.0, 10.0, -4.0), (-10.0, 5.0, -4.0)))
    print("----------")
    print(intersection)
    print
    print("test 3 - should be 4.0, 0.0, -4.0")
    intersection = intersection_vector_and_plane((-1.0, 0.0, 1.0), ((0.0, 0.0, -4.0), (10.0, 10.0, -4.0), (-10.0, 5.0, -4.0)))
    print("----------")
    print(intersection)
    print
