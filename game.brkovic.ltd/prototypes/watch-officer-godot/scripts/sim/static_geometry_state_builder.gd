extends RefCounted

class_name StaticGeometryStateBuilder


func build_static(scenario: Dictionary) -> Dictionary:
	var geometry: Dictionary = scenario["geometry"]
	return {
		"safe_corridor_polygon": geometry["safe_corridor_polygon"].duplicate(true),
		"shallow_zone_polygons": geometry["shallow_zone_polygons"].duplicate(true),
		"danger_polygons": geometry["danger_polygons"].duplicate(true),
		"caution_buffers": geometry["caution_buffers"].duplicate(true),
		"finish_gate": geometry["finish_gate"].duplicate(true)
	}


func build_runtime() -> Dictionary:
	return {
		"state": "in_corridor",
		"previous_state": "in_corridor",
		"active_zone_id": "",
		"nearest_boundary_m_debug": 0.0,
		"safe_corridor_inside": true,
		"shallow_zone_inside": false,
		"finish_gate_crossed": false
	}
