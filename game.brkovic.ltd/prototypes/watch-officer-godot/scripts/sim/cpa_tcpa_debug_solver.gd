extends RefCounted

class_name CpaTcpaDebugSolver


func solve(scenario: Dictionary, ownship: Dictionary, target: Dictionary, previous_cpa_tcpa: Dictionary = {}) -> Dictionary:
	var config: Dictionary = scenario["cpa_tcpa"]
	var horizon_sec: float = float(config["horizon_sec"])
	var active_tcpa_max_sec: float = float(config["active_tcpa_max_sec"])

	var ownship_position: Array = ownship["position_m"]
	var target_position: Array = target["position_m"]
	var ownship_velocity: Array = _velocity_from_heading_speed(float(ownship["heading_deg"]), float(ownship["speed_mps"]))
	var target_velocity: Array = _velocity_from_heading_speed(float(target["heading_deg"]), float(target["speed_mps"]))
	var relative_position: Array = [
		float(target_position[0]) - float(ownship_position[0]),
		float(target_position[1]) - float(ownship_position[1])
	]
	var relative_velocity: Array = [
		target_velocity[0] - ownship_velocity[0],
		target_velocity[1] - ownship_velocity[1]
	]

	var raw_tcpa_sec: float = 0.0
	var relative_speed_sq: float = _dot(relative_velocity, relative_velocity)
	if relative_speed_sq > 0.0:
		raw_tcpa_sec = -_dot(relative_position, relative_velocity) / relative_speed_sq

	var projection_sec: float = clamp(raw_tcpa_sec, 0.0, horizon_sec)
	var closest_ownship: Array = _advance_position(ownship_position, ownship_velocity, projection_sec)
	var closest_target: Array = _advance_position(target_position, target_velocity, projection_sec)
	var cpa_m: float = _distance(closest_ownship, closest_target)
	var active: bool = raw_tcpa_sec >= 0.0 and raw_tcpa_sec <= active_tcpa_max_sec
	var state: String = _qualitative_state(config, cpa_m, active)

	return {
		"state": state,
		"previous_state": previous_cpa_tcpa.get("state", state),
		"cpa_m_debug": cpa_m,
		"tcpa_sec_debug": raw_tcpa_sec,
		"active": active,
		"threshold_set_id": "%s:%s" % [scenario["scenario_id"], scenario["scenario_version"]],
		"closest_point_ownship_m": closest_ownship,
		"closest_point_target_m": closest_target,
		"changed_tick": int(previous_cpa_tcpa.get("changed_tick", 0)),
		"bootstrap_default": false
	}


func _velocity_from_heading_speed(heading_deg: float, speed_mps: float) -> Array:
	var heading_rad: float = deg_to_rad(heading_deg)
	return [
		sin(heading_rad) * speed_mps,
		cos(heading_rad) * speed_mps
	]


func _advance_position(position: Array, velocity: Array, delta_sec: float) -> Array:
	return [
		float(position[0]) + float(velocity[0]) * delta_sec,
		float(position[1]) + float(velocity[1]) * delta_sec
	]


func _qualitative_state(config: Dictionary, cpa_m: float, active: bool) -> String:
	if not active:
		return "safe"
	if cpa_m <= float(config["immediate_cpa_m"]):
		return "immediate"
	if cpa_m <= float(config["danger_cpa_m"]):
		return "danger"
	if cpa_m <= float(config["caution_cpa_m"]):
		return "caution"
	return "safe"


func _dot(a: Array, b: Array) -> float:
	return float(a[0]) * float(b[0]) + float(a[1]) * float(b[1])


func _distance(a: Array, b: Array) -> float:
	var dx: float = float(b[0]) - float(a[0])
	var dy: float = float(b[1]) - float(a[1])
	return sqrt(dx * dx + dy * dy)
