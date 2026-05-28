extends RefCounted

class_name TargetStateBuilder


func build(scenario: Dictionary) -> Dictionary:
	var target: Dictionary = scenario["target_vessels"][0]
	return {
		"id": target["id"],
		"position_m": target["spawn_position"].duplicate(true),
		"heading_deg": target["spawn_heading_deg"],
		"speed_mps": target["speed_mps"],
		"collision_radius_m": target["collision_radius_m"],
		"behaviour": target["behaviour"],
		"range_m": 0.0,
		"bearing_true_deg": 0.0,
		"relative_bearing_deg": 0.0,
		"relative_side": target.get("crossing_from", "ambiguous"),
		"heading_relation": target.get("heading_relation", ""),
		"ais_label": target["ais"]["label"],
		"vector_horizon_sec": target["ais"]["vector_horizon_sec"],
		"vector_end_position_m": null,
		"visible": true
	}
