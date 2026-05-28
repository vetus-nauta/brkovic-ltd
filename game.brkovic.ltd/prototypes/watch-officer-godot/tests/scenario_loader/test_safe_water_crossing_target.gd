extends SceneTree

const ScenarioLoader = preload("res://scripts/core/scenario_loader.gd")
const SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"
const SCENARIO_TWO_PATH := "res://data/scenarios/head-on-port-to-port.json"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var loader := ScenarioLoader.new()
	var scenario := loader.load_scenario(SCENARIO_PATH)
	_assert_true(not scenario.is_empty(), "canonical scenario loads")
	_assert_equal(loader.last_error, {}, "canonical scenario has no loader error")

	if not scenario.is_empty():
		_expect_error("missing_iala_region", scenario, func(data): data.erase("iala_region"), "SCENARIO_FIELD_REQUIRED", "$.iala_region")
		_expect_error("wrong_iala_region_b", scenario, func(data): data["iala_region"] = "B", "SCENARIO_IALA_REGION_UNSUPPORTED", "$.iala_region")
		_expect_error("wrong_rule_review_status", scenario, func(data): data["rule_review_status"] = "final", "SCENARIO_RULE_REVIEW_STATUS_INVALID", "$.rule_review_status")
		_expect_error("vts_enabled", scenario, func(data): data["vts"]["enabled"] = true, "SCENARIO_VTS_MUST_BE_DISABLED", "$.vts.enabled")
		_expect_error("vts_prompt_present", scenario, func(data): data["vts"]["prompts"].append({"message_key": "vts.test"}), "SCENARIO_VTS_PROMPTS_NOT_ALLOWED", "$.vts.prompts")
		_expect_error("zero_targets", scenario, func(data): data["target_vessels"] = [], "SCENARIO_TARGET_COUNT_INVALID", "$.target_vessels")
		_expect_error("two_targets", scenario, func(data): data["target_vessels"].append(data["target_vessels"][0].duplicate(true)), "SCENARIO_TARGET_COUNT_INVALID", "$.target_vessels")
		_expect_error("target_not_starboard", scenario, func(data): data["target_vessels"][0]["crossing_from"] = "port", "SCENARIO_TARGET_CROSSING_SIDE_INVALID", "$.target_vessels[0].crossing_from")
		_expect_error("missing_port_lateral", scenario, func(data): data["marks"] = [data["marks"][1]], "SCENARIO_LATERAL_PAIR_INVALID", "$.marks")
		_expect_error("missing_starboard_lateral", scenario, func(data): data["marks"] = [data["marks"][0]], "SCENARIO_LATERAL_PAIR_INVALID", "$.marks")
		_expect_error("mark_wrong_region", scenario, func(data): data["marks"][0]["iala_region"] = "B", "SCENARIO_MARK_REGION_INVALID", "$.marks[0].iala_region")
		_expect_error("missing_safe_corridor", scenario, func(data): data["geometry"].erase("safe_corridor_polygon"), "SCENARIO_GEOMETRY_REQUIRED", "$.geometry.safe_corridor_polygon")
		_expect_error("missing_shallow_zones", scenario, func(data): data["geometry"].erase("shallow_zone_polygons"), "SCENARIO_GEOMETRY_REQUIRED", "$.geometry.shallow_zone_polygons")
		_expect_error("empty_shallow_zones", scenario, func(data): data["geometry"]["shallow_zone_polygons"] = [], "SCENARIO_GEOMETRY_REQUIRED", "$.geometry.shallow_zone_polygons")
		_expect_error("missing_caution_buffers", scenario, func(data): data["geometry"].erase("caution_buffers"), "SCENARIO_GEOMETRY_REQUIRED", "$.geometry.caution_buffers")
		_expect_error("missing_replay_seed", scenario, func(data): data["replay"].erase("seed"), "SCENARIO_REPLAY_METADATA_REQUIRED", "$.replay.seed")
		_expect_error("missing_fixed_tick", scenario, func(data): data["replay"].erase("fixed_tick_hz"), "SCENARIO_REPLAY_METADATA_REQUIRED", "$.replay.fixed_tick_hz")
		_expect_error("wrong_tolerance", scenario, func(data): data["replay"]["event_timing_tolerance_ticks"] = 2, "SCENARIO_REPLAY_TOLERANCE_INVALID", "$.replay.event_timing_tolerance_ticks")
		_expect_error("input_log_not_required", scenario, func(data): data["replay"]["input_log_required"] = false, "SCENARIO_REPLAY_METADATA_REQUIRED", "$.replay.input_log_required")
		_expect_error("event_log_not_required", scenario, func(data): data["replay"]["event_log_required"] = false, "SCENARIO_REPLAY_METADATA_REQUIRED", "$.replay.event_log_required")

	var scenario_two := loader.load_scenario(SCENARIO_TWO_PATH)
	_assert_true(not scenario_two.is_empty(), "scenario two loads")
	_assert_equal(loader.last_error, {}, "scenario two has no loader error")

	if not scenario_two.is_empty():
		_assert_equal(scenario_two["scenario_id"], "head-on-port-to-port", "scenario two id")
		_assert_equal(scenario_two["encounter"]["expected_initial_class"], "head_on", "scenario two encounter class")
		_assert_equal(scenario_two["encounter"]["expected_player_role"], "head_on_alter_starboard", "scenario two player role")
		_assert_equal(scenario_two["target_vessels"][0]["heading_relation"], "reciprocal_or_nearly_reciprocal", "scenario two target heading relation")
		_assert_equal(scenario_two["marks"].size(), 0, "scenario two allows no lateral marks")
		_expect_error_at_path("scenario_two_wrong_iala_region_b", scenario_two, SCENARIO_TWO_PATH, func(data): data["iala_region"] = "B", "SCENARIO_IALA_REGION_UNSUPPORTED", "$.iala_region")
		_expect_error_at_path("scenario_two_vts_enabled", scenario_two, SCENARIO_TWO_PATH, func(data): data["vts"]["enabled"] = true, "SCENARIO_VTS_MUST_BE_DISABLED", "$.vts.enabled")
		_expect_error_at_path("scenario_two_missing_heading_relation", scenario_two, SCENARIO_TWO_PATH, func(data): data["target_vessels"][0].erase("heading_relation"), "SCENARIO_TARGET_HEADING_RELATION_INVALID", "$.target_vessels[0].heading_relation")
		_expect_error_at_path("scenario_two_wrong_heading_relation", scenario_two, SCENARIO_TWO_PATH, func(data): data["target_vessels"][0]["heading_relation"] = "crossing", "SCENARIO_TARGET_HEADING_RELATION_INVALID", "$.target_vessels[0].heading_relation")
		_expect_error_at_path("scenario_two_wrong_encounter_class", scenario_two, SCENARIO_TWO_PATH, func(data): data["encounter"]["expected_initial_class"] = "crossing", "SCENARIO_ENCOUNTER_CONTRACT_INVALID", "$.encounter.expected_initial_class")
		_expect_error_at_path("scenario_two_wrong_player_role", scenario_two, SCENARIO_TWO_PATH, func(data): data["encounter"]["expected_player_role"] = "give_way", "SCENARIO_ENCOUNTER_CONTRACT_INVALID", "$.encounter.expected_player_role")
		_expect_error_at_path("scenario_two_missing_bearing_tolerance", scenario_two, SCENARIO_TWO_PATH, func(data): data["encounter"]["classifier_thresholds"].erase("head_on_bearing_ahead_tolerance_deg"), "SCENARIO_ENCOUNTER_CONTRACT_INVALID", "$.encounter.classifier_thresholds.head_on_bearing_ahead_tolerance_deg")
		_expect_error_at_path("scenario_two_mark_wrong_region", scenario_two, SCENARIO_TWO_PATH, func(data): data["marks"] = [{"id": "test", "iala_region": "B"}], "SCENARIO_MARK_REGION_INVALID", "$.marks[0].iala_region")

	print("scenario_loader_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _expect_error(test_id: String, source: Dictionary, mutate: Callable, expected_code: String, expected_json_path: String) -> void:
	_expect_error_at_path(test_id, source, SCENARIO_PATH, mutate, expected_code, expected_json_path)


func _expect_error_at_path(test_id: String, source: Dictionary, scenario_path: String, mutate: Callable, expected_code: String, expected_json_path: String) -> void:
	var data := source.duplicate(true)
	mutate.call(data)

	var loader := ScenarioLoader.new()
	var result := loader.validate_scenario(data, scenario_path)
	_assert_true(result.is_empty(), "%s rejects invalid data" % test_id)
	_assert_equal(loader.last_error.get("code"), expected_code, "%s error code" % test_id)
	_assert_equal(loader.last_error.get("json_path"), expected_json_path, "%s json path" % test_id)
	_assert_equal(loader.last_error.get("blocking"), true, "%s blocking error" % test_id)


func _assert_true(value: bool, label: String) -> void:
	if value:
		_pass(label)
	else:
		_fail(label, true, value)


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
