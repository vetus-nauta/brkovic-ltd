extends RefCounted

class_name RuntimeSnapshotExporter


func export_snapshot(runtime_state: Dictionary) -> Dictionary:
	var root: Dictionary = runtime_state["root"]
	var scenario_static: Dictionary = runtime_state["scenario_static"]
	var ownship: Dictionary = runtime_state["ownship"]
	var target: Dictionary = runtime_state["target"]
	var qa: Dictionary = runtime_state["qa"].duplicate(true)
	if runtime_state.has("scenario_two"):
		qa["scenario_two_debug"] = runtime_state["scenario_two"].get("debug", {}).duplicate(true)

	var snapshot := {
		"tick": root["tick"],
		"time_sec": root["time_sec"],
		"scenario_state": root["scenario_state"],
		"scenario_result": root["scenario_result"],
		"draft_training": root["draft_training"],
		"scenario_static": {
			"scenario_id": scenario_static["scenario_id"],
			"scenario_version": scenario_static["scenario_version"],
			"title_key": scenario_static["title_key"],
			"rule_review_status": scenario_static["rule_review_status"],
			"training_claim_status": scenario_static["training_claim_status"],
			"iala_region": scenario_static["iala_region"]
		},
		"camera": {
			"mode": scenario_static["camera"]["mode"],
			"ownship_anchor_target": scenario_static["camera"]["ownship_screen_anchor"].duplicate(true),
			"ownship_anchor_actual_debug": scenario_static["camera"]["ownship_screen_anchor"].duplicate(true),
			"forward_view_ratio": scenario_static["camera"]["forward_view_ratio"],
			"north_angle_deg": 0.0
		},
		"ownship": {
			"position_m": ownship["position_m"].duplicate(true),
			"heading_deg": ownship["heading_deg"],
			"speed_level": ownship["speed_level"],
			"speed_mps": ownship["speed_mps"],
			"turn_state": ownship["turn_state"],
			"turn_rate_deg_per_sec": ownship["turn_rate_deg_per_sec"],
			"projected_vector_end_m": ownship["projected_vector_end_m"],
			"collision_radius_m": ownship["collision_radius_m"],
			"grounding_state": ownship["grounding_state"],
			"recent_track_m": ownship["recent_track_m"].duplicate(true)
		},
		"target": {
			"id": target["id"],
			"position_m": target["position_m"].duplicate(true),
			"heading_deg": target["heading_deg"],
			"speed_mps": target["speed_mps"],
			"range_m": target["range_m"],
			"bearing_true_deg": target["bearing_true_deg"],
			"relative_bearing_deg": target["relative_bearing_deg"],
			"relative_side": target["relative_side"],
			"vector_end_position_m": target["vector_end_position_m"],
			"visible": target["visible"]
		},
		"encounter": runtime_state["encounter"].duplicate(true),
		"cpa_tcpa": runtime_state["cpa_tcpa"].duplicate(true),
		"safe_water": {
			"state": runtime_state["safe_water"]["state"],
			"active_zone_id": runtime_state["safe_water"]["active_zone_id"],
			"nearest_boundary_m_debug": runtime_state["safe_water"]["nearest_boundary_m_debug"],
			"finish_gate_crossed": runtime_state["safe_water"]["finish_gate_crossed"]
		},
		"warnings": runtime_state["warnings"].duplicate(true),
		"vts": runtime_state["vts"].duplicate(true),
		"qa": qa
	}

	if runtime_state.has("scenario_two"):
		snapshot["scenario_two"] = _export_scenario_two(runtime_state["scenario_two"])

	return snapshot


func _export_scenario_two(scenario_two: Dictionary) -> Dictionary:
	return {
		"classifier_status": scenario_two["classifier_status"],
		"encounter_class": scenario_two["encounter_class"],
		"player_role": scenario_two["player_role"],
		"initial_match": scenario_two["initial_match"],
		"early_starboard_status": scenario_two["early_starboard_status"],
		"early_starboard_detected": scenario_two["early_starboard_detected"],
		"early_starboard_tick": scenario_two["early_starboard_tick"],
		"early_starboard_time_sec": scenario_two["early_starboard_time_sec"],
		"port_to_port_status": scenario_two["port_to_port_status"],
		"port_to_port_achieved": scenario_two["port_to_port_achieved"],
		"pass_relationship": scenario_two["pass_relationship"],
		"draft_training_logic": scenario_two["draft_training_logic"],
		"last_event_types": scenario_two["last_event_types"].duplicate(true)
	}
