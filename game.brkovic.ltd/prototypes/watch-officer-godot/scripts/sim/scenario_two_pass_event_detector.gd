extends RefCounted

class_name ScenarioTwoPassEventDetector

const SCENARIO_ID := "head-on-port-to-port"
const EARLY_STARBOARD_ACTION_ID := "early_starboard_alteration"
const MIN_CLEAR_HEADING_DELTA_DEG := 5.0
const EVENT_EARLY_STARBOARD_DETECTED := "scenario_two_early_starboard_alteration_detected"
const EVENT_PORT_TO_PORT_PASS_ACHIEVED := "scenario_two_port_to_port_pass_achieved"


func detect_early_starboard_alteration(scenario: Dictionary, heading_samples: Array) -> Dictionary:
	var window: Dictionary = _expected_action_window(scenario, EARLY_STARBOARD_ACTION_ID)
	var baseline_heading_deg := 0.0
	if not heading_samples.is_empty():
		baseline_heading_deg = float(heading_samples[0].get("heading_deg", 0.0))

	var result := {
		"scenario_id": scenario.get("scenario_id", ""),
		"event_type": EVENT_EARLY_STARBOARD_DETECTED,
		"status": "not_detected",
		"detected": false,
		"action_window_id": EARLY_STARBOARD_ACTION_ID,
		"window_start_sec": float(window.get("start_sec", 0.0)),
		"window_end_sec": float(window.get("end_sec", 0.0)),
		"tick": -1,
		"time_sec": -1.0,
		"heading_delta_deg_debug": 0.0,
		"minimum_heading_delta_deg_debug": MIN_CLEAR_HEADING_DELTA_DEG,
		"draft_training_logic": true
	}

	if scenario.get("scenario_id") != SCENARIO_ID or window.is_empty():
		return result

	for sample in heading_samples:
		var time_sec := float(sample.get("time_sec", -1.0))
		if time_sec < float(window["start_sec"]) or time_sec > float(window["end_sec"]):
			continue
		var heading_delta := _signed_heading_delta(baseline_heading_deg, float(sample.get("heading_deg", baseline_heading_deg)))
		if heading_delta >= MIN_CLEAR_HEADING_DELTA_DEG:
			result["status"] = "detected"
			result["detected"] = true
			result["tick"] = int(sample.get("tick", -1))
			result["time_sec"] = time_sec
			result["heading_delta_deg_debug"] = heading_delta
			return result

	return result


func detect_port_to_port_pass(scenario: Dictionary, pass_sample: Dictionary) -> Dictionary:
	var pass_relationship: String = pass_sample.get("pass_relationship", "unknown")
	var cpa_state: String = pass_sample.get("cpa_state", "unknown")
	var collision: bool = bool(pass_sample.get("collision", false))
	var near_miss: bool = bool(pass_sample.get("near_miss", false))
	var separation_m: float = float(pass_sample.get("separation_m", 0.0))
	var cpa_allows_pass: bool = ["safe", "caution"].has(cpa_state)
	var achieved: bool = scenario.get("scenario_id") == SCENARIO_ID and pass_relationship == "port_to_port" and cpa_allows_pass and not collision and not near_miss

	return {
		"scenario_id": scenario.get("scenario_id", ""),
		"event_type": EVENT_PORT_TO_PORT_PASS_ACHIEVED,
		"status": "achieved" if achieved else "not_achieved",
		"achieved": achieved,
		"pass_relationship": pass_relationship,
		"cpa_state": cpa_state,
		"separation_m_debug": separation_m,
		"collision": collision,
		"near_miss": near_miss,
		"tick": int(pass_sample.get("tick", -1)),
		"time_sec": float(pass_sample.get("time_sec", -1.0)),
		"draft_training_logic": true
	}


func append_detection_event(event_log: RefCounted, detection: Dictionary) -> Dictionary:
	return event_log.append_event(detection["event_type"], build_event_payload(detection), int(detection.get("tick", 0)), float(detection.get("time_sec", 0.0)))


func build_event_payload(detection: Dictionary) -> Dictionary:
	var payload := detection.duplicate(true)
	payload.erase("event_type")
	return payload


func _expected_action_window(scenario: Dictionary, window_id: String) -> Dictionary:
	var scoring: Dictionary = scenario.get("scoring", {})
	for window in scoring.get("expected_action_windows", []):
		if typeof(window) == TYPE_DICTIONARY and window.get("id") == window_id:
			return window.duplicate(true)
	return {}


func _signed_heading_delta(from_deg: float, to_deg: float) -> float:
	return fposmod(to_deg - from_deg + 540.0, 360.0) - 180.0
