extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const RuntimeStepOrchestrator = preload("res://scripts/runtime/runtime_step_orchestrator.gd")
const HudSnapshotBinder = preload("res://scripts/ui/hud_snapshot_binder.gd")
const SCENARIO_PATH := "res://data/scenarios/head-on-port-to-port.json"
const HUD_BINDER_PATH := "res://scripts/ui/hud_snapshot_binder.gd"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var bootstrap := RuntimeBootstrap.new()
	var bootstrap_result := bootstrap.bootstrap(SCENARIO_PATH)
	_assert_equal(bootstrap.last_error, {}, "scenario 2 loader success required")

	var binder := HudSnapshotBinder.new()
	var scenario := _load_scenario()
	var runtime_state: Dictionary = bootstrap_result["runtime_state"]
	var bootstrap_snapshot: Dictionary = bootstrap_result["runtime_snapshot"]
	var ready_hud: Dictionary = binder.build_sections(bootstrap_snapshot, "ready")

	_assert_contains(str(ready_hud["briefing"]), "Head-On Port-to-Port Drill", "briefing shows scenario 2 title")
	_assert_contains(str(ready_hud["briefing"]), "Draft training scenario - not final maritime instruction.", "briefing shows draft limitation")
	_assert_contains(str(ready_hud["briefing"]), "alter starboard early", "briefing includes starboard action")
	_assert_contains(str(ready_hud["briefing"]), "Port-to-port pass", "briefing includes port-to-port objective")
	_assert_contains(str(ready_hud["result_status"]), "Encounter: head_on / head_on_alter_starboard", "result status binds scenario 2 encounter state")
	_assert_contains(str(ready_hud["result_status"]), "VTS: false/inactive", "scenario 2 HUD keeps VTS inactive")

	var opening_hud: Dictionary = binder.build_sections(bootstrap_snapshot, "running")
	_assert_equal(opening_hud["decision_coaching_primary"], "Head-on risk. Alter starboard early.", "opening cue uses scenario 2 wording")
	_assert_equal(opening_hud["decision_coaching_chips"], ["Head-on", "Draft training"], "opening cue has capped scenario 2 chips")

	var orchestrator := RuntimeStepOrchestrator.new()
	var step_result: Dictionary = orchestrator.step(scenario, runtime_state, [], {
		"scenario_two_heading_samples": [
			{"tick": 0, "time_sec": 0.0, "heading_deg": 0.0},
			{"tick": 240, "time_sec": 12.0, "heading_deg": 6.0}
		],
		"scenario_two_pass_sample": {
			"tick": 920,
			"time_sec": 46.0,
			"pass_relationship": "port_to_port",
			"cpa_state": "safe",
			"separation_m": 96.0,
			"collision": false,
			"near_miss": false
		}
	})
	var achieved_snapshot: Dictionary = step_result["runtime_snapshot"]
	var active_achieved_snapshot := achieved_snapshot.duplicate(true)
	active_achieved_snapshot["scenario_result"] = "running"
	active_achieved_snapshot["cpa_tcpa"]["state"] = "safe"
	active_achieved_snapshot["warnings"]["primary_warning"] = null
	active_achieved_snapshot["warnings"]["secondary_warnings"] = []
	var achieved_hud: Dictionary = binder.build_sections(active_achieved_snapshot, "running")
	_assert_equal(achieved_hud["decision_coaching_primary"], "Port-to-port pass achieved.", "port-to-port cue uses Engine-owned state")
	_assert_equal(achieved_hud["decision_coaching_chips"], ["Port-to-port", "Draft training"], "port-to-port cue has capped chips")
	_assert_contains(str(achieved_hud["result_status"]), "Early starboard: Early starboard alteration made", "HUD binds early starboard status")
	_assert_contains(str(achieved_hud["result_status"]), "Port-to-port: Port-to-port pass achieved", "HUD binds pass status")

	var completed_hud: Dictionary = binder.build_sections(achieved_snapshot, "completed", {"reason": "success"})
	_assert_contains(str(completed_hud["result_feedback"]), "Early starboard alteration made.", "result feedback explains early starboard")
	_assert_contains(str(completed_hud["result_feedback"]), "Port-to-port pass achieved.", "result feedback explains port-to-port")
	_assert_contains(str(completed_hud["result_feedback"]), "Draft training scenario - captain note, not final maritime instruction.", "result feedback keeps draft limit")

	var player_text := "\n".join([
		str(ready_hud["briefing"]),
		str(opening_hud["decision_coaching"]),
		str(achieved_hud["decision_coaching"]),
		str(achieved_hud["result_status"]),
		str(completed_hud["result_feedback"])
	])
	_assert_not_contains(player_text, "scenario_two_debug", "player HUD does not expose scenario two debug branch")
	_assert_not_contains(player_text, "relative_heading", "player HUD does not expose relative heading debug")
	_assert_not_contains(player_text, "separation_m", "player HUD does not expose separation debug")
	_assert_not_contains(player_text, "96.0", "player HUD does not expose numeric debug separation")
	_assert_not_contains(player_text, "COLREGS", "player HUD does not make COLREGS claims")
	_assert_not_contains(player_text, "official", "player HUD does not make official claims")
	_assert_not_contains(player_text, "certified", "player HUD does not make certified claims")
	_assert_not_contains(player_text, "legally correct", "player HUD does not make legal correctness claims")

	var hud_source := _read_text_file(HUD_BINDER_PATH)
	_assert_equal(hud_source.find("scripts/sim/"), -1, "HUD binder does not import simulation modules")
	_assert_equal(hud_source.find("ScenarioTwoHeadOnClassifier"), -1, "HUD binder does not compute scenario two classifier")
	_assert_equal(hud_source.find("ScenarioTwoPassEventDetector"), -1, "HUD binder does not compute scenario two pass event")
	_assert_equal(hud_source.find("CpaTcpaDebugSolver"), -1, "HUD binder does not compute CPA/TCPA")
	_assert_equal(hud_source.find("scenario_two_debug"), -1, "HUD binder does not read scenario two QA debug")

	print("scenario_two_hud_binding_readability_pack_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _load_scenario() -> Dictionary:
	var file := FileAccess.open(SCENARIO_PATH, FileAccess.READ)
	var parser := JSON.new()
	parser.parse(file.get_as_text())
	return parser.data


func _read_text_file(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return ""
	var text := file.get_as_text()
	file.close()
	return text


func _assert_contains(actual: String, expected_substring: String, label: String) -> void:
	if actual.find(expected_substring) >= 0:
		_pass(label)
	else:
		_fail(label, expected_substring, actual)


func _assert_not_contains(actual: String, unexpected_substring: String, label: String) -> void:
	if actual.find(unexpected_substring) == -1:
		_pass(label)
	else:
		_fail(label, "absent: %s" % unexpected_substring, actual)


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
