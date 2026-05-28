extends RefCounted

class_name RuntimeState

const OwnshipStateBuilderScript = preload("res://scripts/sim/ownship_state_builder.gd")
const TargetStateBuilderScript = preload("res://scripts/sim/target_state_builder.gd")
const StaticGeometryStateBuilderScript = preload("res://scripts/sim/static_geometry_state_builder.gd")

const ENGINE_VERSION := "prototype-runtime-bootstrap-0.1"


func build(scenario: Dictionary, run_id: String, clock_snapshot: Dictionary) -> Dictionary:
	var ownship_builder := OwnshipStateBuilderScript.new()
	var target_builder := TargetStateBuilderScript.new()
	var geometry_builder := StaticGeometryStateBuilderScript.new()

	var root := {
		"run_id": run_id,
		"engine_version": ENGINE_VERSION,
		"tick": clock_snapshot["tick"],
		"time_sec": clock_snapshot["time_sec"],
		"fixed_tick_hz": clock_snapshot["fixed_tick_hz"],
		"scenario_state": "ready",
		"scenario_result": "ready",
		"draft_training": true
	}

	var state := {
		"root": root,
		"scenario_static": _build_static(scenario, geometry_builder),
		"ownship": ownship_builder.build(scenario),
		"target": target_builder.build(scenario),
		"safe_water": geometry_builder.build_runtime(),
		"encounter": {
			"class": scenario["encounter"]["expected_initial_class"],
			"player_role": scenario["encounter"]["expected_player_role"],
			"confidence": 1.0,
			"expected_initial_class": scenario["encounter"]["expected_initial_class"],
			"expected_player_role": scenario["encounter"]["expected_player_role"],
			"initial_match": true,
			"draft_training_logic": true
		},
		"cpa_tcpa": {
			"state": "safe",
			"previous_state": "safe",
			"cpa_m_debug": 0.0,
			"tcpa_sec_debug": 0.0,
			"active": false,
			"threshold_set_id": "%s:%s" % [scenario["scenario_id"], scenario["scenario_version"]],
			"closest_point_ownship_m": null,
			"closest_point_target_m": null,
			"changed_tick": clock_snapshot["tick"],
			"bootstrap_default": true
		},
		"warnings": {
			"primary_warning": null,
			"secondary_warnings": []
		},
		"vts": {
			"enabled": false,
			"state": "inactive",
			"prompt_id": "",
			"options": [],
			"remaining_sec": 0.0,
			"selected_option_id": "",
			"result": "none",
			"blocks_scenario_completion": false
		},
		"qa": {
			"replay_recording": true,
			"seed": scenario["replay"]["seed"],
			"fixed_tick_hz": scenario["replay"]["fixed_tick_hz"],
			"event_timing_tolerance_ticks": scenario["replay"]["event_timing_tolerance_ticks"],
			"validation_errors": []
		}
	}

	if scenario["scenario_id"] == "head-on-port-to-port":
		state["scenario_two"] = _build_scenario_two_state(clock_snapshot["tick"])

	return state


func _build_static(scenario: Dictionary, geometry_builder: RefCounted) -> Dictionary:
	return {
		"scenario_id": scenario["scenario_id"],
		"scenario_version": scenario["scenario_version"],
		"title_key": scenario["title_key"],
		"briefing_key": scenario["briefing_key"],
		"rule_review_status": scenario["rule_review_status"],
		"training_claim_status": scenario["training_claim_status"],
		"iala_region": scenario["iala_region"],
		"world": {
			"units": scenario["world"]["units"]
		},
		"camera": {
			"mode": scenario["camera"]["mode"],
			"ownship_screen_anchor": scenario["camera"]["ownship_screen_anchor"].duplicate(true),
			"forward_view_ratio": scenario["camera"]["forward_view_ratio"]
		},
		"marks": scenario["marks"].duplicate(true),
		"geometry": geometry_builder.build_static(scenario),
		"vts": {
			"enabled": scenario["vts"]["enabled"]
		}
	}


func _build_scenario_two_state(tick: int) -> Dictionary:
	return {
		"encounter_class": "head_on",
		"player_role": "head_on_alter_starboard",
		"initial_match": true,
		"classifier_status": "bootstrap",
		"early_starboard_status": "not_detected",
		"early_starboard_detected": false,
		"early_starboard_tick": -1,
		"early_starboard_time_sec": -1.0,
		"port_to_port_status": "not_achieved",
		"port_to_port_achieved": false,
		"pass_relationship": "unknown",
		"draft_training_logic": true,
		"last_event_types": [],
		"changed_tick": tick,
		"debug": {
			"relative_heading_deg": 0.0,
			"reciprocal_error_deg": 0.0,
			"bearing_ahead_delta_deg": 0.0,
			"heading_delta_deg": 0.0,
			"separation_m": 0.0
		}
	}
