extends SceneTree

const SCENE_PATH := "res://scenes/playable_greybox_scene.tscn"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var main_scene_path := str(ProjectSettings.get_setting("application/run/main_scene", ""))
	_assert_equal(main_scene_path, SCENE_PATH, "project main scene points to playable greybox scene")

	var packed_scene: PackedScene = load(SCENE_PATH)
	_assert_equal(packed_scene != null, true, "playable scene file exists and loads")

	var scene := packed_scene.instantiate()
	root.add_child(scene)
	await process_frame

	_assert_equal(scene.has_method("advance_one_tick"), true, "scene controller exposes orchestrated tick method")
	_assert_equal(scene.has_method("queue_keyboard_input"), true, "scene controller exposes keyboard input mapping")
	_assert_equal(scene.has_method("reset_scenario"), true, "scene controller exposes reset")

	var initial_snapshot: Dictionary = scene.get_runtime_snapshot()
	_assert_equal(initial_snapshot["tick"], 0, "scene boots deterministic tick 0")
	_assert_almost_equal(float(initial_snapshot["time_sec"]), 0.0, "scene boots deterministic time 0")
	_assert_equal(initial_snapshot["scenario_result"], "ready", "scene boots ready result")
	_assert_equal(initial_snapshot["vts"]["enabled"], false, "VTS remains disabled")
	_assert_equal(initial_snapshot["vts"]["state"], "inactive", "VTS remains inactive")
	_assert_equal(initial_snapshot["draft_training"], true, "draft/non-final status is present in snapshot")

	var step_result: Dictionary = scene.advance_one_tick([])
	var stepped_snapshot: Dictionary = step_result["runtime_snapshot"]
	_assert_equal(stepped_snapshot["tick"], 1, "scene/controller can advance one fixed tick through orchestrator")
	_assert_almost_equal(float(stepped_snapshot["time_sec"]), 0.05, "scene/controller advances one 20 Hz tick")
	_assert_equal(stepped_snapshot.has("ownship"), true, "snapshot includes ownship")
	_assert_equal(stepped_snapshot.has("target"), true, "snapshot includes target")
	_assert_equal(stepped_snapshot.has("encounter"), true, "snapshot includes encounter")
	_assert_equal(stepped_snapshot.has("cpa_tcpa"), true, "snapshot includes CPA/TCPA")
	_assert_equal(stepped_snapshot.has("safe_water"), true, "snapshot includes safe-water")
	_assert_equal(stepped_snapshot.has("warnings"), true, "snapshot includes warnings")
	_assert_equal(stepped_snapshot.has("qa"), true, "snapshot includes QA/debug fields")
	_assert_equal(stepped_snapshot["scenario_result"], "running", "baseline first playable tick remains non-terminal")

	var speed_record: Dictionary = scene.queue_keyboard_input(KEY_E, true)
	_assert_equal(speed_record["tick"], 2, "keyboard speed-up mapping targets next orchestrator tick")
	_assert_equal(speed_record["input_type"], "speed_set", "keyboard speed-up mapping creates speed_set input")
	_assert_equal(speed_record["input_source"], "keyboard", "keyboard mapping marks input source")
	_assert_equal(scene.get_queued_input_records().size(), 1, "keyboard mapping queues one orchestrator-compatible input record")

	var turn_record: Dictionary = scene.queue_keyboard_input(KEY_A, true)
	_assert_equal(turn_record["input_type"], "turn_port_pressed", "keyboard port mapping creates turn_port_pressed input")
	var release_record: Dictionary = scene.queue_keyboard_input(KEY_A, false)
	_assert_equal(release_record["input_type"], "turn_released", "keyboard port release mapping creates turn_released input")

	scene.reset_scenario()
	var reset_snapshot: Dictionary = scene.get_runtime_snapshot()
	_assert_equal(reset_snapshot["tick"], 0, "reset returns tick to deterministic initial state")
	_assert_almost_equal(float(reset_snapshot["time_sec"]), 0.0, "reset returns time to deterministic initial state")
	_assert_equal(reset_snapshot["scenario_result"], "ready", "reset returns result to ready")
	_assert_equal(scene.get_queued_input_records(), [], "reset clears queued inputs")

	scene.queue_free()
	print("playable_greybox_scene_pack_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


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
