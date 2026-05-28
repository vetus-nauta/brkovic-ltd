extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const RangeBearingUpdater = preload("res://scripts/sim/range_bearing_updater.gd")
const ScenarioOneEncounterClassifier = preload("res://scripts/sim/scenario_one_encounter_classifier.gd")
const CpaTcpaDebugSolver = preload("res://scripts/sim/cpa_tcpa_debug_solver.gd")
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
	var warnings_start: Dictionary = runtime_state["warnings"].duplicate(true)
	var safe_water_start: Dictionary = runtime_state["safe_water"].duplicate(true)
	var scenario_result_start = runtime_state["root"]["scenario_result"]
	var event_log_start: Array = bootstrap_result["event_log"].duplicate(true)

	var range_bearing_updater := RangeBearingUpdater.new()
	var target_geometry := range_bearing_updater.update_target_geometry(runtime_state["ownship"], runtime_state["target"])
	var classifier := ScenarioOneEncounterClassifier.new()
	var encounter := classifier.classify(scenario, target_geometry)
	var encounter_start := encounter.duplicate(true)

	var previous_cpa_tcpa: Dictionary = runtime_state["cpa_tcpa"].duplicate(true)
	previous_cpa_tcpa["state"] = "caution"
	previous_cpa_tcpa["changed_tick"] = 42

	var solver := CpaTcpaDebugSolver.new()
	var cpa_tcpa := solver.solve(scenario, runtime_state["ownship"], target_geometry, previous_cpa_tcpa)
	var repeated := solver.solve(scenario, runtime_state["ownship"], target_geometry, previous_cpa_tcpa)

	_assert_number(cpa_tcpa["cpa_m_debug"], "solver returns numeric cpa_m_debug")
	_assert_number(cpa_tcpa["tcpa_sec_debug"], "solver returns numeric tcpa_sec_debug")
	_assert_almost_equal(float(cpa_tcpa["cpa_m_debug"]), 146.6936, "CPA debug value is deterministic")
	_assert_almost_equal(float(cpa_tcpa["tcpa_sec_debug"]), 53.5789, "TCPA debug value is deterministic")
	_assert_point_almost_equal(cpa_tcpa["closest_point_ownship_m"], [0.0, 133.9473], "closest ownship point is deterministic")
	_assert_point_almost_equal(cpa_tcpa["closest_point_target_m"], [-75.0314, 260.0], "closest target point is deterministic")
	_assert_equal(_state_allowed(scenario, cpa_tcpa["state"]), true, "solver output state is one of scenario qualitative states")
	_assert_equal(cpa_tcpa["state"], "safe", "CPA/TCPA state maps through scenario thresholds")
	_assert_equal(cpa_tcpa["active"], true, "CPA/TCPA is active inside active TCPA window")
	_assert_equal(cpa_tcpa["previous_state"], "caution", "previous state is preserved when provided")
	_assert_equal(cpa_tcpa["changed_tick"], 42, "changed tick is preserved when provided")
	_assert_equal(cpa_tcpa, repeated, "repeated calls with same inputs return same output")

	_assert_equal(runtime_state["warnings"], warnings_start, "warnings remain unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "scenario result unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario result remains ready")
	_assert_equal(runtime_state["safe_water"], safe_water_start, "safe-water geometry state remains unchanged")
	_assert_equal(encounter, encounter_start, "encounter class remains existing scenario-1 draft output")
	_assert_equal(encounter["class"], "crossing", "encounter class remains crossing")
	_assert_equal(encounter["player_role"], "give_way", "encounter player role remains give_way")
	_assert_equal(bootstrap_result["event_log"], event_log_start, "no warning or result event is emitted by this slice")

	print("cpa_tcpa_numeric_debug_solver_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _load_scenario() -> Dictionary:
	var file := FileAccess.open(SCENARIO_PATH, FileAccess.READ)
	var parser := JSON.new()
	parser.parse(file.get_as_text())
	return parser.data


func _state_allowed(scenario: Dictionary, state: String) -> bool:
	return scenario["cpa_tcpa"]["qualitative_states"].has(state)


func _assert_number(actual: Variant, label: String) -> void:
	if typeof(actual) == TYPE_FLOAT or typeof(actual) == TYPE_INT:
		_pass(label)
	else:
		_fail(label, "number", actual)


func _assert_almost_equal(actual: float, expected: float, label: String) -> void:
	if abs(actual - expected) <= 0.0001:
		_pass(label)
	else:
		_fail(label, expected, actual)


func _assert_point_almost_equal(actual: Array, expected: Array, label: String) -> void:
	if abs(float(actual[0]) - float(expected[0])) <= 0.0001 and abs(float(actual[1]) - float(expected[1])) <= 0.0001:
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
