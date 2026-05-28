extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const EventLog = preload("res://scripts/core/event_log.gd")
const RangeBearingUpdater = preload("res://scripts/sim/range_bearing_updater.gd")
const ScenarioTwoHeadOnClassifier = preload("res://scripts/sim/scenario_two_head_on_classifier.gd")
const SCENARIO_PATH := "res://data/scenarios/head-on-port-to-port.json"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var bootstrap := RuntimeBootstrap.new()
	var bootstrap_result := bootstrap.bootstrap(SCENARIO_PATH)
	_assert_equal(bootstrap.last_error, {}, "loader success required")

	var scenario := _load_scenario()
	var runtime_state: Dictionary = bootstrap_result["runtime_state"]
	var cpa_start: Dictionary = runtime_state["cpa_tcpa"].duplicate(true)
	var warnings_start: Dictionary = runtime_state["warnings"].duplicate(true)
	var safe_water_start: Dictionary = runtime_state["safe_water"].duplicate(true)
	var scenario_result_start = runtime_state["root"]["scenario_result"]

	var range_bearing_updater := RangeBearingUpdater.new()
	var target_geometry := range_bearing_updater.update_target_geometry(runtime_state["ownship"], runtime_state["target"])
	var classifier := ScenarioTwoHeadOnClassifier.new()
	var classified_encounter := classifier.classify(scenario, runtime_state["ownship"], target_geometry)
	var repeat_classification := classifier.classify(scenario, runtime_state["ownship"], target_geometry)

	_assert_equal(classified_encounter["class"], "head_on", "classifier returns head_on")
	_assert_equal(classified_encounter["player_role"], "head_on_alter_starboard", "classifier returns head_on_alter_starboard")
	_assert_equal(classified_encounter["initial_match"], true, "initial_match is true")
	_assert_equal(classified_encounter["draft_training_logic"], true, "draft_training_logic is true")
	_assert_almost_equal(float(classified_encounter["confidence"]), 0.9, "confidence is deterministic numeric value")
	_assert_equal(classified_encounter, repeat_classification, "classification repeats deterministically")
	_assert_equal(classified_encounter["expected_initial_class"], scenario["encounter"]["expected_initial_class"], "expected class carried from scenario")
	_assert_equal(classified_encounter["expected_player_role"], scenario["encounter"]["expected_player_role"], "expected role carried from scenario")
	_assert_equal(classified_encounter["target_heading_relation"], "reciprocal_or_nearly_reciprocal", "target heading relation carried")
	_assert_almost_equal(float(classified_encounter["relative_heading_deg_debug"]), 180.0, "relative heading is reciprocal")
	_assert_almost_equal(float(classified_encounter["reciprocal_error_deg_debug"]), 0.0, "reciprocal error is zero")
	_assert_almost_equal(float(classified_encounter["bearing_ahead_delta_deg_debug"]), 0.0, "target starts ahead")

	var event_log := EventLog.new()
	event_log.configure({
		"run_id": runtime_state["root"]["run_id"],
		"scenario_id": scenario["scenario_id"],
		"scenario_version": scenario["scenario_version"],
		"engine_version": runtime_state["root"]["engine_version"],
		"seed": scenario["replay"]["seed"],
		"fixed_tick_hz": scenario["replay"]["fixed_tick_hz"]
	})
	var event := classifier.append_initial_classification_event(event_log, classified_encounter, 0, 0.0)
	_assert_equal(event["type"], "scenario_two_head_on_initial_classified", "event type is deterministic")
	_assert_equal(event["payload"]["encounter_class"], "head_on", "event payload encounter class")
	_assert_equal(event["payload"]["player_role"], "head_on_alter_starboard", "event payload player role")
	_assert_equal(event["payload"]["initial_match"], true, "event payload initial match")
	_assert_equal(event["payload"]["draft_training_logic"], true, "event payload draft flag")
	_assert_equal(event["payload"]["target_heading_relation"], "reciprocal_or_nearly_reciprocal", "event payload heading relation")
	_assert_equal(event_log.get_event_types(), ["scenario_two_head_on_initial_classified"], "event log contains only classifier event")

	var wrong_relation_target := target_geometry.duplicate(true)
	wrong_relation_target["heading_relation"] = "crossing"
	var wrong_relation := classifier.classify(scenario, runtime_state["ownship"], wrong_relation_target)
	_assert_equal(wrong_relation["class"], "ambiguous", "wrong relation does not classify as head_on")
	_assert_equal(wrong_relation["player_role"], "none", "wrong relation has no player role")
	_assert_equal(wrong_relation["initial_match"], false, "wrong relation initial_match false")

	var off_bow_target := target_geometry.duplicate(true)
	off_bow_target["relative_bearing_deg"] = 25.0
	var off_bow := classifier.classify(scenario, runtime_state["ownship"], off_bow_target)
	_assert_equal(off_bow["class"], "ambiguous", "off-bow target is not accepted by scenario threshold")
	_assert_equal(off_bow["initial_match"], false, "off-bow target initial_match false")

	var non_reciprocal_target := target_geometry.duplicate(true)
	non_reciprocal_target["heading_deg"] = 140.0
	var non_reciprocal := classifier.classify(scenario, runtime_state["ownship"], non_reciprocal_target)
	_assert_equal(non_reciprocal["class"], "ambiguous", "non-reciprocal heading is not accepted")
	_assert_equal(non_reciprocal["initial_match"], false, "non-reciprocal initial_match false")

	var wrong_scenario := scenario.duplicate(true)
	wrong_scenario["scenario_id"] = "safe-water-crossing-target"
	var wrong_scenario_classification := classifier.classify(wrong_scenario, runtime_state["ownship"], target_geometry)
	_assert_equal(wrong_scenario_classification["class"], "ambiguous", "wrong scenario id is rejected")
	_assert_equal(wrong_scenario_classification["initial_match"], false, "wrong scenario initial_match false")

	_assert_equal(runtime_state["cpa_tcpa"], cpa_start, "CPA/TCPA state remains unchanged")
	_assert_equal(runtime_state["warnings"], warnings_start, "warnings remain unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "scenario result unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario result remains ready")
	_assert_equal(runtime_state["safe_water"], safe_water_start, "no safe-water geometry state change is produced")

	print("scenario_two_head_on_classifier_event_log_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _load_scenario() -> Dictionary:
	var file := FileAccess.open(SCENARIO_PATH, FileAccess.READ)
	var parser := JSON.new()
	parser.parse(file.get_as_text())
	return parser.data


func _assert_almost_equal(actual: float, expected: float, label: String) -> void:
	if abs(actual - expected) <= 0.0001:
		_pass(label)
	else:
		_fail(label, expected, actual)


func _assert_equal(actual: Variant, expected: Variant, label: String) -> void:
	if actual == expected:
		_pass(label)
	else:
		_fail(label, expected, actual)


func _pass(label: String) -> void:
	_passed += 1
	print("PASS: %s" % label)


func _fail(label: String, expected: Variant, actual: Variant) -> void:
	_failed += 1
	push_error("FAIL: %s expected=%s actual=%s" % [label, expected, actual])
