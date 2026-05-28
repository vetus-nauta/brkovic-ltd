extends RefCounted

class_name ScenarioOneEncounterClassifier

const MATCH_CONFIDENCE := 0.9
const NO_MATCH_CONFIDENCE := 0.0


func classify(scenario: Dictionary, target: Dictionary) -> Dictionary:
	var expected_class: String = scenario["encounter"]["expected_initial_class"]
	var expected_role: String = scenario["encounter"]["expected_player_role"]
	var target_relative_side: String = target.get("relative_side", "ambiguous")

	var encounter_class := "ambiguous"
	var player_role := "none"
	if expected_class == "crossing" and target_relative_side == "starboard":
		encounter_class = "crossing"
	if encounter_class == "crossing" and expected_role == "give_way":
		player_role = "give_way"

	var initial_match := encounter_class == expected_class and player_role == expected_role
	return {
		"class": encounter_class,
		"player_role": player_role,
		"confidence": MATCH_CONFIDENCE if initial_match else NO_MATCH_CONFIDENCE,
		"expected_initial_class": expected_class,
		"expected_player_role": expected_role,
		"initial_match": initial_match,
		"draft_training_logic": true
	}
