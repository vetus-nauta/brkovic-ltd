extends RefCounted

class_name SafeWaterGeometryMonitor

const EPSILON := 0.000001


func evaluate(scenario: Dictionary, ownship: Dictionary, previous_safe_water: Dictionary = {}) -> Dictionary:
	var geometry: Dictionary = scenario["geometry"]
	var position: Array = ownship["position_m"]
	var safe_corridor: Array = geometry["safe_corridor_polygon"]
	var shallow_zones: Array = geometry["shallow_zone_polygons"]
	var caution_buffers: Dictionary = geometry["caution_buffers"]

	var safe_corridor_inside: bool = _point_in_polygon(position, safe_corridor)
	var nearest_corridor_boundary: float = _distance_to_polygon(position, safe_corridor)
	var shallow_zone_index: int = _first_containing_polygon(position, shallow_zones)
	var shallow_zone_inside: bool = shallow_zone_index >= 0
	var nearest_shallow := _nearest_polygon_distance(position, shallow_zones)
	var safe_corridor_buffer_m: float = float(caution_buffers["safe_corridor_edge_m"])
	var shallow_warning_m: float = float(caution_buffers["shallow_warning_m"])

	var state := "in_corridor"
	var active_zone_id := ""
	var nearest_boundary_m_debug := nearest_corridor_boundary
	if ownship.get("grounding_state", "clear") == "grounded":
		state = "grounded"
		active_zone_id = "grounding_state"
		nearest_boundary_m_debug = nearest_shallow if shallow_zone_inside else nearest_corridor_boundary
	elif shallow_zone_inside:
		state = "shallow"
		active_zone_id = "shallow_zone_%s" % shallow_zone_index
		nearest_boundary_m_debug = nearest_shallow
	elif nearest_shallow <= shallow_warning_m:
		state = "shallow_buffer"
		active_zone_id = "shallow_zone_buffer"
		nearest_boundary_m_debug = nearest_shallow
	elif safe_corridor_inside and nearest_corridor_boundary <= safe_corridor_buffer_m:
		state = "corridor_buffer"
		active_zone_id = "safe_corridor_edge"
		nearest_boundary_m_debug = nearest_corridor_boundary
	elif safe_corridor_inside:
		state = "in_corridor"
		nearest_boundary_m_debug = nearest_corridor_boundary
	else:
		state = "corridor_buffer"
		active_zone_id = "safe_corridor_edge"
		nearest_boundary_m_debug = nearest_corridor_boundary

	return {
		"state": state,
		"previous_state": previous_safe_water.get("state", state),
		"active_zone_id": active_zone_id,
		"nearest_boundary_m_debug": nearest_boundary_m_debug,
		"safe_corridor_inside": safe_corridor_inside,
		"shallow_zone_inside": shallow_zone_inside,
		"finish_gate_crossed": bool(previous_safe_water.get("finish_gate_crossed", false)) or _finish_gate_crossed(ownship, geometry["finish_gate"])
	}


func _point_in_polygon(point: Array, polygon: Array) -> bool:
	var x: float = float(point[0])
	var y: float = float(point[1])
	var inside := false
	var j: int = polygon.size() - 1
	for i in range(polygon.size()):
		var pi: Array = polygon[i]
		var pj: Array = polygon[j]
		var xi: float = float(pi[0])
		var yi: float = float(pi[1])
		var xj: float = float(pj[0])
		var yj: float = float(pj[1])
		if _point_on_segment(point, pj, pi):
			return true
		var crosses: bool = (yi > y) != (yj > y)
		if crosses:
			var intersect_x: float = (xj - xi) * (y - yi) / (yj - yi) + xi
			if x < intersect_x:
				inside = not inside
		j = i
	return inside


func _first_containing_polygon(point: Array, polygons: Array) -> int:
	for index in range(polygons.size()):
		if _point_in_polygon(point, polygons[index]):
			return index
	return -1


func _distance_to_polygon(point: Array, polygon: Array) -> float:
	var nearest: float = 1000000000.0
	var previous: Array = polygon[polygon.size() - 1]
	for vertex in polygon:
		var distance: float = _distance_to_segment(point, previous, vertex)
		if distance < nearest:
			nearest = distance
		previous = vertex
	return nearest


func _nearest_polygon_distance(point: Array, polygons: Array) -> float:
	var nearest: float = 1000000000.0
	for polygon in polygons:
		var distance: float = _distance_to_polygon(point, polygon)
		if distance < nearest:
			nearest = distance
	return nearest


func _distance_to_segment(point: Array, segment_start: Array, segment_end: Array) -> float:
	var px: float = float(point[0])
	var py: float = float(point[1])
	var ax: float = float(segment_start[0])
	var ay: float = float(segment_start[1])
	var bx: float = float(segment_end[0])
	var by: float = float(segment_end[1])
	var dx: float = bx - ax
	var dy: float = by - ay
	var length_sq: float = dx * dx + dy * dy
	if length_sq <= EPSILON:
		return _distance(point, segment_start)
	var t: float = clamp(((px - ax) * dx + (py - ay) * dy) / length_sq, 0.0, 1.0)
	var closest: Array = [ax + t * dx, ay + t * dy]
	return _distance(point, closest)


func _finish_gate_crossed(ownship: Dictionary, finish_gate: Array) -> bool:
	var track: Array = ownship.get("recent_track_m", [])
	if track.size() >= 2:
		var previous_position: Array = track[track.size() - 2]
		var current_position: Array = track[track.size() - 1]
		return _segments_intersect(previous_position, current_position, finish_gate[0], finish_gate[1])
	return _point_on_segment(ownship["position_m"], finish_gate[0], finish_gate[1])


func _segments_intersect(a: Array, b: Array, c: Array, d: Array) -> bool:
	var o1: float = _orientation(a, b, c)
	var o2: float = _orientation(a, b, d)
	var o3: float = _orientation(c, d, a)
	var o4: float = _orientation(c, d, b)
	if o1 * o2 < 0.0 and o3 * o4 < 0.0:
		return true
	if abs(o1) <= EPSILON and _point_on_segment(c, a, b):
		return true
	if abs(o2) <= EPSILON and _point_on_segment(d, a, b):
		return true
	if abs(o3) <= EPSILON and _point_on_segment(a, c, d):
		return true
	if abs(o4) <= EPSILON and _point_on_segment(b, c, d):
		return true
	return false


func _orientation(a: Array, b: Array, c: Array) -> float:
	return (float(b[0]) - float(a[0])) * (float(c[1]) - float(a[1])) - (float(b[1]) - float(a[1])) * (float(c[0]) - float(a[0]))


func _point_on_segment(point: Array, segment_start: Array, segment_end: Array) -> bool:
	var cross: float = _orientation(segment_start, segment_end, point)
	if abs(cross) > EPSILON:
		return false
	var px: float = float(point[0])
	var py: float = float(point[1])
	var min_x: float = min(float(segment_start[0]), float(segment_end[0])) - EPSILON
	var max_x: float = max(float(segment_start[0]), float(segment_end[0])) + EPSILON
	var min_y: float = min(float(segment_start[1]), float(segment_end[1])) - EPSILON
	var max_y: float = max(float(segment_start[1]), float(segment_end[1])) + EPSILON
	return px >= min_x and px <= max_x and py >= min_y and py <= max_y


func _distance(a: Array, b: Array) -> float:
	var dx: float = float(b[0]) - float(a[0])
	var dy: float = float(b[1]) - float(a[1])
	return sqrt(dx * dx + dy * dy)
