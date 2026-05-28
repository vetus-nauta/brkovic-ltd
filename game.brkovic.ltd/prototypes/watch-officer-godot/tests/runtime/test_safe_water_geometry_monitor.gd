extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const SafeWaterGeometryMonitor = preload("res://scripts/sim/safe_water_geometry_monitor.gd")
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
	var cpa_start: Dictionary = runtime_state["cpa_tcpa"].duplicate(true)
	var scenario_result_start = runtime_state["root"]["scenario_result"]
	var event_log_start: Array = bootstrap_result["event_log"].duplicate(true)

	var monitor := SafeWaterGeometryMonitor.new()
	var spawn_state := monitor.evaluate(scenario, runtime_state["ownship"], runtime_state["safe_water"])
	_assert_equal(spawn_state["state"], "in_corridor", "spawn position starts in corridor")
	_assert_equal(spawn_state["safe_corridor_inside"], true, "spawn is inside safe corridor polygon")
	_assert_equal(spawn_state["shallow_zone_inside"], false, "spawn is outside shallow zones")
	_assert_almost_equal(float(spawn_state["nearest_boundary_m_debug"]), 40.0, "spawn nearest boundary is deterministic")
	_assert_equal(spawn_state["previous_state"], "in_corridor", "previous safe-water state is preserved when provided")

	var corridor_edge_ownship := _ownship_at(runtime_state["ownship"], [43.0, 0.0])
	var corridor_edge_state := monitor.evaluate(scenario, corridor_edge_ownship, spawn_state)
	_assert_equal(corridor_edge_state["state"], "corridor_buffer", "point near corridor edge maps deterministically to corridor_buffer")
	_assert_equal(corridor_edge_state["active_zone_id"], "safe_corridor_edge", "corridor buffer active zone is deterministic")
	_assert_almost_equal(float(corridor_edge_state["nearest_boundary_m_debug"]), 2.3703, "corridor buffer nearest boundary is deterministic")
	_assert_equal(corridor_edge_state["previous_state"], "in_corridor", "previous state remains preserved after corridor sample")

	var shallow_buffer_ownship := _ownship_at(runtime_state["ownship"], [53.0, 0.0])
	var shallow_buffer_state := monitor.evaluate(scenario, shallow_buffer_ownship, corridor_edge_state)
	_assert_equal(shallow_buffer_state["state"], "shallow_buffer", "shallow approach buffer maps deterministically to shallow_buffer")
	_assert_equal(shallow_buffer_state["shallow_zone_inside"], false, "shallow buffer sample remains outside shallow polygon")
	_assert_almost_equal(float(shallow_buffer_state["nearest_boundary_m_debug"]), 5.2962, "shallow buffer nearest boundary is deterministic")

	var shallow_ownship := _ownship_at(runtime_state["ownship"], [70.0, 0.0])
	var shallow_state := monitor.evaluate(scenario, shallow_ownship, shallow_buffer_state)
	_assert_equal(shallow_state["state"], "shallow", "point inside shallow zone maps deterministically to shallow")
	_assert_equal(shallow_state["shallow_zone_inside"], true, "shallow sample is inside shallow zone")
	_assert_equal(shallow_state["active_zone_id"], "shallow_zone_1", "shallow active zone id is deterministic")
	_assert_almost_equal(float(shallow_state["nearest_boundary_m_debug"]), 11.7034, "shallow nearest boundary is deterministic")

	var finish_ownship := _ownship_with_track(runtime_state["ownship"], [0.0, 470.0], [0.0, 490.0])
	var finish_state := monitor.evaluate(scenario, finish_ownship, shallow_state)
	_assert_equal(finish_state["finish_gate_crossed"], true, "finish gate crossing flag can become true for a crossing sample")
	_assert_equal(finish_state["state"], "in_corridor", "finish sample remains geometry-only in corridor")

	_assert_equal(runtime_state["warnings"], warnings_start, "warnings remain unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "scenario result unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario result remains ready")
	_assert_equal(runtime_state["cpa_tcpa"], cpa_start, "CPA/TCPA state remains unchanged")
	_assert_equal(bootstrap_result["event_log"], event_log_start, "no warning or result event is emitted by this slice")

	print("safe_water_geometry_monitor_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _load_scenario() -> Dictionary:
	var file := FileAccess.open(SCENARIO_PATH, FileAccess.READ)
	var parser := JSON.new()
	parser.parse(file.get_as_text())
	return parser.data


func _ownship_at(ownship: Dictionary, position: Array) -> Dictionary:
	var next_ownship: Dictionary = ownship.duplicate(true)
	next_ownship["position_m"] = position.duplicate(true)
	next_ownship["recent_track_m"] = [position.duplicate(true)]
	return next_ownship


func _ownship_with_track(ownship: Dictionary, previous_position: Array, current_position: Array) -> Dictionary:
	var next_ownship: Dictionary = ownship.duplicate(true)
	next_ownship["position_m"] = current_position.duplicate(true)
	next_ownship["recent_track_m"] = [previous_position.duplicate(true), current_position.duplicate(true)]
	return next_ownship


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
