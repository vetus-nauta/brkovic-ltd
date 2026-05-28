extends RefCounted

class_name OwnshipStateBuilder


func build(scenario: Dictionary) -> Dictionary:
	var ownship: Dictionary = scenario["ownship"]
	var speed_level: String = ownship["initial_speed_level"]
	return {
		"id": ownship["id"],
		"position_m": ownship["spawn_position"].duplicate(true),
		"heading_deg": ownship["spawn_heading_deg"],
		"speed_level": speed_level,
		"speed_mps": _speed_for_level(ownship["speed_levels"], speed_level),
		"turn_state": "none",
		"turn_rate_deg_per_sec": ownship["turn_rate_deg_per_sec"].get(speed_level, 0),
		"speed_transition_state": "stable",
		"projected_vector_end_m": null,
		"collision_radius_m": ownship["collision_radius_m"],
		"grounding_radius_m": ownship["grounding_radius_m"],
		"grounding_state": "clear",
		"recent_track_m": [ownship["spawn_position"].duplicate(true)]
	}


func _speed_for_level(speed_levels: Array, speed_level: String) -> float:
	for level in speed_levels:
		if level.get("id") == speed_level:
			return float(level.get("speed_mps", 0.0))
	return 0.0
