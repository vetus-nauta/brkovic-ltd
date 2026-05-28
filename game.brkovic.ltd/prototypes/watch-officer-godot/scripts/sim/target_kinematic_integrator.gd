extends RefCounted

class_name TargetKinematicIntegrator


func step(target: Dictionary, delta_sec: float) -> Dictionary:
	var next_state := target.duplicate(true)
	if next_state.get("behaviour") != "constant_course_speed":
		return next_state

	next_state["position_m"] = _advance_position(
		next_state["position_m"],
		float(next_state["heading_deg"]),
		float(next_state["speed_mps"]),
		delta_sec
	)
	next_state["vector_end_position_m"] = compute_vector_end(next_state)
	return next_state


func compute_vector_end(target: Dictionary) -> Array:
	return _advance_position(
		target["position_m"],
		float(target["heading_deg"]),
		float(target["speed_mps"]),
		float(target["vector_horizon_sec"])
	)


func _advance_position(position_value: Variant, heading_deg: float, speed_mps: float, delta_sec: float) -> Array:
	var heading_rad := deg_to_rad(heading_deg)
	var distance_m := speed_mps * delta_sec
	var position: Array = position_value.duplicate(true)
	position[0] = float(position[0]) + sin(heading_rad) * distance_m
	position[1] = float(position[1]) + cos(heading_rad) * distance_m
	return position
