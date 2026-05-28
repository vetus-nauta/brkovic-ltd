extends RefCounted

class_name OwnshipKinematicIntegrator


func step(ownship: Dictionary, ownship_config: Dictionary, input_records: Array, delta_sec: float) -> Dictionary:
	var next_state := ownship.duplicate(true)

	for input_record in input_records:
		_apply_input(next_state, ownship_config, input_record)

	var turn_rate := float(next_state.get("turn_rate_deg_per_sec", 0.0))
	if next_state.get("turn_state") == "port":
		next_state["heading_deg"] = _normalize_heading(float(next_state["heading_deg"]) - turn_rate * delta_sec)
	elif next_state.get("turn_state") == "starboard":
		next_state["heading_deg"] = _normalize_heading(float(next_state["heading_deg"]) + turn_rate * delta_sec)

	var heading_rad := deg_to_rad(float(next_state["heading_deg"]))
	var distance_m := float(next_state["speed_mps"]) * delta_sec
	var position: Array = next_state["position_m"].duplicate(true)
	position[0] = float(position[0]) + sin(heading_rad) * distance_m
	position[1] = float(position[1]) + cos(heading_rad) * distance_m
	next_state["position_m"] = position
	next_state["recent_track_m"].append(position.duplicate(true))

	return next_state


func _apply_input(ownship: Dictionary, ownship_config: Dictionary, input_record: Dictionary) -> void:
	match input_record.get("input_type"):
		"turn_port_pressed":
			ownship["turn_state"] = "port"
			_update_turn_rate(ownship, ownship_config)
		"turn_starboard_pressed":
			ownship["turn_state"] = "starboard"
			_update_turn_rate(ownship, ownship_config)
		"turn_released":
			ownship["turn_state"] = "none"
			ownship["turn_rate_deg_per_sec"] = 0
		"speed_set":
			_set_speed_level(ownship, ownship_config, str(input_record.get("input_value")))


func _set_speed_level(ownship: Dictionary, ownship_config: Dictionary, speed_level: String) -> void:
	for level in ownship_config["speed_levels"]:
		if level.get("id") == speed_level:
			ownship["speed_level"] = speed_level
			ownship["speed_mps"] = float(level.get("speed_mps", 0.0))
			_update_turn_rate(ownship, ownship_config)
			return


func _update_turn_rate(ownship: Dictionary, ownship_config: Dictionary) -> void:
	if ownship.get("turn_state") == "none":
		ownship["turn_rate_deg_per_sec"] = 0
		return
	var speed_level := str(ownship.get("speed_level"))
	ownship["turn_rate_deg_per_sec"] = float(ownship_config["turn_rate_deg_per_sec"].get(speed_level, 0.0))


func _normalize_heading(heading_deg: float) -> float:
	return fposmod(heading_deg, 360.0)
