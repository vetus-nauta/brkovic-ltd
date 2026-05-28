extends RefCounted

class_name ScenarioTwoHeadOnClassifier

const SCENARIO_ID := "head-on-port-to-port"
const TARGET_HEADING_RELATION := "reciprocal_or_nearly_reciprocal"
const MATCH_CONFIDENCE := 0.9
const NO_MATCH_CONFIDENCE := 0.0
const EVENT_INITIAL_CLASSIFIED := "scenario_two_head_on_initial_classified"


func classify(scenario: Dictionary, ownship: Dictionary, target: Dictionary) -> Dictionary:
	var expected_class: String = scenario["encounter"]["expected_initial_class"]
	var expected_role: String = scenario["encounter"]["expected_player_role"]
	var thresholds: Dictionary = scenario["encounter"]["classifier_thresholds"]
	var relative_heading_deg: float = _angle_difference(float(ownship["heading_deg"]), float(target["heading_deg"]))
	var reciprocal_error_deg: float = abs(180.0 - relative_heading_deg)
	var relative_bearing_deg: float = float(target.get("relative_bearing_deg", 999.0))
	var bearing_ahead_delta_deg: float = min(relative_bearing_deg, abs(360.0 - relative_bearing_deg))
	var relation: String = target.get("heading_relation", "")

	var scenario_matches: bool = scenario.get("scenario_id") == SCENARIO_ID
	var expected_contract_matches: bool = expected_class == "head_on" and expected_role == "head_on_alter_starboard"
	var reciprocal_matches: bool = reciprocal_error_deg <= float(thresholds["head_on_relative_heading_deg"])
	var bearing_matches: bool = bearing_ahead_delta_deg <= float(thresholds["head_on_bearing_ahead_tolerance_deg"])
	var relation_matches: bool = relation == TARGET_HEADING_RELATION

	var encounter_class: String = "ambiguous"
	var player_role: String = "none"
	if scenario_matches and expected_contract_matches and reciprocal_matches and bearing_matches and relation_matches:
		encounter_class = "head_on"
		player_role = "head_on_alter_starboard"

	var initial_match: bool = encounter_class == expected_class and player_role == expected_role
	return {
		"class": encounter_class,
		"player_role": player_role,
		"confidence": MATCH_CONFIDENCE if initial_match else NO_MATCH_CONFIDENCE,
		"expected_initial_class": expected_class,
		"expected_player_role": expected_role,
		"initial_match": initial_match,
		"draft_training_logic": true,
		"scenario_id": scenario.get("scenario_id", ""),
		"target_heading_relation": relation,
		"relative_heading_deg_debug": relative_heading_deg,
		"reciprocal_error_deg_debug": reciprocal_error_deg,
		"bearing_ahead_delta_deg_debug": bearing_ahead_delta_deg
	}


func append_initial_classification_event(event_log: RefCounted, classification: Dictionary, tick := 0, time_sec := 0.0) -> Dictionary:
	return event_log.append_event(EVENT_INITIAL_CLASSIFIED, build_initial_classification_event_payload(classification), tick, time_sec)


func build_initial_classification_event_payload(classification: Dictionary) -> Dictionary:
	return {
		"scenario_id": classification["scenario_id"],
		"encounter_class": classification["class"],
		"player_role": classification["player_role"],
		"expected_initial_class": classification["expected_initial_class"],
		"expected_player_role": classification["expected_player_role"],
		"initial_match": classification["initial_match"],
		"draft_training_logic": classification["draft_training_logic"],
		"target_heading_relation": classification["target_heading_relation"],
		"relative_heading_deg_debug": classification["relative_heading_deg_debug"],
		"reciprocal_error_deg_debug": classification["reciprocal_error_deg_debug"],
		"bearing_ahead_delta_deg_debug": classification["bearing_ahead_delta_deg_debug"]
	}


func _angle_difference(a_deg: float, b_deg: float) -> float:
	var diff: float = abs(fposmod(a_deg - b_deg + 180.0, 360.0) - 180.0)
	return diff
