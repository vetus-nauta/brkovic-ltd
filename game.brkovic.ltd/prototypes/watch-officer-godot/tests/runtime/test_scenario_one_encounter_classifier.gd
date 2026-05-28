extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const RangeBearingUpdater = preload("res://scripts/sim/range_bearing_updater.gd")
const ScenarioOneEncounterClassifier = preload("res://scripts/sim/scenario_one_encounter_classifier.gd")
const SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"

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
	var classifier := ScenarioOneEncounterClassifier.new()
	var classified_encounter := classifier.classify(scenario, target_geometry)
	var repeat_classification := classifier.classify(scenario, target_geometry)

	_assert_equal(classified_encounter["class"], "crossing", "classifier returns crossing")
	_assert_equal(classified_encounter["player_role"], "give_way", "classifier returns give_way")
	_assert_equal(classified_encounter["initial_match"], true, "initial_match is true")
	_assert_equal(classified_encounter["draft_training_logic"], true, "draft_training_logic is true")
	_assert_almost_equal(float(classified_encounter["confidence"]), 0.9, "confidence is deterministic numeric value")
	_assert_equal(classified_encounter, repeat_classification, "classification repeats deterministically")
	_assert_equal(classified_encounter["expected_initial_class"], scenario["encounter"]["expected_initial_class"], "expected class carried from scenario")
	_assert_equal(classified_encounter["expected_player_role"], scenario["encounter"]["expected_player_role"], "expected role carried from scenario")
	_assert_equal(target_geometry["relative_side"], "starboard", "classifier input relative side is starboard")

	_assert_equal(runtime_state["cpa_tcpa"], cpa_start, "CPA/TCPA state remains unchanged")
	_assert_equal(runtime_state["warnings"], warnings_start, "warnings remain unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "scenario result unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario result remains ready")
	_assert_equal(runtime_state["safe_water"], safe_water_start, "no safe-water geometry state change is produced")
	_assert_equal(runtime_state["safe_water"]["state"], "in_corridor", "safe-water state remains bootstrap value")

	print("scenario_one_encounter_classifier_test: %s passed, %s failed" % [_passed, _failed])
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
