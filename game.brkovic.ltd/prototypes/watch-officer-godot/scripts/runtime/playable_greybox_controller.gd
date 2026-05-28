extends Node2D

class_name PlayableGreyboxController

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const ScenarioLoader = preload("res://scripts/core/scenario_loader.gd")
const RuntimeStepOrchestrator = preload("res://scripts/runtime/runtime_step_orchestrator.gd")
const HudSnapshotBinder = preload("res://scripts/ui/hud_snapshot_binder.gd")

const DEFAULT_SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"
const SCENARIO_TWO_PATH := "res://data/scenarios/head-on-port-to-port.json"
const VIEW_SCALE := 1.25
const OWNERSHIP_ANCHOR_FALLBACK := [0.5, 0.7]
const TERMINAL_RESULT_STATES := ["success", "warning_outcome", "unsafe_manoeuvre", "near_miss", "grounding", "collision", "load_blocked"]
const LOCAL_SCENARIO_OPTIONS := [
	{
		"title": "Scenario 1 - Safe Water / Crossing Target",
		"path": DEFAULT_SCENARIO_PATH,
		"status": "Available | Draft training | Region A / VTS inactive"
	},
	{
		"title": "Scenario 2 - Head-On Port-to-Port Drill",
		"path": SCENARIO_TWO_PATH,
		"status": "Available locally | Draft training | Region A / VTS inactive"
	}
]

var scenario: Dictionary = {}
var runtime_state: Dictionary = {}
var runtime_snapshot: Dictionary = {}
var scenario_result_detail: Dictionary = {}
var last_loader_error: Dictionary = {}
var local_attempt_state := "ready"
var _scenario_path := DEFAULT_SCENARIO_PATH
var _selected_scenario_index := 0

var _orchestrator := RuntimeStepOrchestrator.new()
var _hud_binder := HudSnapshotBinder.new()
var _queued_input_records: Array = []
var _tick_accumulator_sec := 0.0
var _hud_label: Label
var _warning_stack_label: Label
var _result_status_label: Label
var _attempt_status_label: Label
var _captain_report_label: Label
var _briefing_panel_label: Label
var _result_feedback_label: Label
var _coaching_rail_label: Label
var _debug_status_label: Label
var _cue_legend_label: Label
var _instructions_label: Label
var _scenario_selector: OptionButton
var _scenario_selector_status_label: Label
var _hud_sections: Dictionary = {}


func _ready() -> void:
	_hud_label = get_node_or_null("HudLayer/HudLabel")
	_warning_stack_label = get_node_or_null("HudLayer/WarningStackLabel")
	_result_status_label = get_node_or_null("HudLayer/ResultStatusLabel")
	_attempt_status_label = get_node_or_null("HudLayer/AttemptStatusLabel")
	_captain_report_label = get_node_or_null("HudLayer/CaptainReportLabel")
	_briefing_panel_label = get_node_or_null("HudLayer/BriefingPanelLabel")
	_result_feedback_label = get_node_or_null("HudLayer/ResultFeedbackLabel")
	_coaching_rail_label = get_node_or_null("HudLayer/CoachingRailLabel")
	_debug_status_label = get_node_or_null("HudLayer/DebugStatusLabel")
	_cue_legend_label = get_node_or_null("HudLayer/CueLegendLabel")
	_instructions_label = get_node_or_null("HudLayer/InstructionsLabel")
	_scenario_selector = get_node_or_null("HudLayer/ScenarioSelector")
	_scenario_selector_status_label = get_node_or_null("HudLayer/ScenarioSelectorStatusLabel")
	_setup_scenario_selector()
	reset_scenario()
	set_process(true)


func _process(delta: float) -> void:
	if runtime_state.is_empty():
		return
	if local_attempt_state != "running":
		return
	_tick_accumulator_sec += delta
	var fixed_tick_hz := int(runtime_state["root"]["fixed_tick_hz"])
	var fixed_delta := 1.0 / float(fixed_tick_hz)
	while _tick_accumulator_sec >= fixed_delta:
		_tick_accumulator_sec -= fixed_delta
		advance_one_tick(_drain_queued_input_records())


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and not event.echo:
		queue_keyboard_input(event.keycode, event.pressed)


func reset_scenario() -> void:
	last_loader_error = {}
	local_attempt_state = "ready"
	_tick_accumulator_sec = 0.0
	_queued_input_records = []

	var loader := ScenarioLoader.new()
	scenario = loader.load_scenario(_scenario_path)
	if scenario.is_empty() or not loader.last_error.is_empty():
		last_loader_error = loader.last_error.duplicate(true)
		runtime_state = {}
		runtime_snapshot = {}
		_update_hud()
		queue_redraw()
		return

	var bootstrap := RuntimeBootstrap.new()
	var bootstrap_result := bootstrap.bootstrap(_scenario_path)
	if not bootstrap_result.get("loader_error", {}).is_empty():
		last_loader_error = bootstrap_result["loader_error"].duplicate(true)
		runtime_state = {}
		runtime_snapshot = {}
		_update_hud()
		queue_redraw()
		return

	runtime_state = bootstrap_result["runtime_state"].duplicate(true)
	runtime_snapshot = bootstrap_result["runtime_snapshot"].duplicate(true)
	scenario_result_detail = {
		"state": runtime_state["root"]["scenario_result"],
		"previous_state": runtime_state["root"]["scenario_result"],
		"changed_tick": runtime_state["root"]["tick"],
		"reason": "reset",
		"active_warning_ids": [],
		"debug_payload": {}
	}
	_update_hud()
	queue_redraw()


func set_scenario_path(path: String) -> Dictionary:
	_scenario_path = path
	_selected_scenario_index = _scenario_index_for_path(path)
	reset_scenario()
	_sync_scenario_selector_selection()
	return {
		"action": "set_scenario_path",
		"scenario_path": _scenario_path,
		"loader_error": last_loader_error.duplicate(true),
		"attempt_state": local_attempt_state
	}


func load_scenario_path(path: String) -> Dictionary:
	return set_scenario_path(path)


func get_scenario_path() -> String:
	return _scenario_path


func select_scenario_index(index: int) -> Dictionary:
	if index < 0 or index >= LOCAL_SCENARIO_OPTIONS.size():
		return {
			"action": "select_scenario_index",
			"selected_index": _selected_scenario_index,
			"scenario_path": _scenario_path,
			"loader_error": {
				"code": "invalid_scenario_index",
				"index": index
			},
			"attempt_state": local_attempt_state
		}
	var option: Dictionary = LOCAL_SCENARIO_OPTIONS[index]
	_selected_scenario_index = index
	return set_scenario_path(str(option["path"]))


func get_selected_scenario_index() -> int:
	return _selected_scenario_index


func get_scenario_selector_snapshot() -> Dictionary:
	return {
		"selected_index": _selected_scenario_index,
		"scenario_path": _scenario_path,
		"options": LOCAL_SCENARIO_OPTIONS.duplicate(true),
		"visible": _scenario_selector != null and _scenario_selector.visible,
		"status_text": _scenario_selector_status_label.text if _scenario_selector_status_label != null else ""
	}


func advance_one_tick(input_records: Array = [], external_flags: Dictionary = {}) -> Dictionary:
	if scenario.is_empty() or runtime_state.is_empty():
		return {}
	if local_attempt_state == "completed":
		return {
			"runtime_state": runtime_state.duplicate(true),
			"runtime_snapshot": runtime_snapshot.duplicate(true),
			"scenario_result": scenario_result_detail.duplicate(true),
			"applied_input_records": [],
			"update_order": []
		}
	if local_attempt_state == "ready":
		start_attempt()
	var result: Dictionary = _orchestrator.step(scenario, runtime_state, input_records, external_flags)
	runtime_state = result["runtime_state"].duplicate(true)
	runtime_snapshot = result["runtime_snapshot"].duplicate(true)
	scenario_result_detail = result["scenario_result"].duplicate(true)
	if _is_terminal_result(str(runtime_snapshot["scenario_result"])):
		local_attempt_state = "completed"
	_update_hud()
	queue_redraw()
	return result


func queue_keyboard_input(keycode: int, pressed: bool) -> Dictionary:
	if keycode == KEY_R and pressed:
		return restart_attempt()

	if (keycode == KEY_SPACE or keycode == KEY_ENTER) and pressed:
		return start_attempt()

	if local_attempt_state == "completed":
		return {}

	var input_type := ""
	var input_value: Variant = true
	match keycode:
		KEY_A, KEY_LEFT:
			input_type = "turn_port_pressed" if pressed else "turn_released"
		KEY_D, KEY_RIGHT:
			input_type = "turn_starboard_pressed" if pressed else "turn_released"
		KEY_Q, KEY_DOWN:
			if pressed:
				input_type = "speed_set"
				input_value = _adjacent_speed_level(-1)
		KEY_E, KEY_UP:
			if pressed:
				input_type = "speed_set"
				input_value = _adjacent_speed_level(1)

	if input_type == "":
		return {}

	if local_attempt_state == "ready":
		start_attempt()
	var record := _make_input_record(input_type, input_value)
	_queued_input_records.append(record.duplicate(true))
	return record


func start_attempt() -> Dictionary:
	if runtime_state.is_empty():
		return {}
	if local_attempt_state == "ready":
		local_attempt_state = "running"
		_update_hud()
		queue_redraw()
	return {
		"action": "start_attempt",
		"attempt_state": local_attempt_state
	}


func restart_attempt() -> Dictionary:
	reset_scenario()
	return {
		"action": "restart_attempt",
		"attempt_state": local_attempt_state
	}


func get_runtime_snapshot() -> Dictionary:
	return runtime_snapshot.duplicate(true)


func get_runtime_state() -> Dictionary:
	return runtime_state.duplicate(true)


func get_queued_input_records() -> Array:
	return _queued_input_records.duplicate(true)


func get_hud_text_snapshot() -> Dictionary:
	return _hud_sections.duplicate(true)


func get_local_attempt_state() -> String:
	return local_attempt_state


func get_scenario_result_detail() -> Dictionary:
	return scenario_result_detail.duplicate(true)


func _make_input_record(input_type: String, input_value: Variant) -> Dictionary:
	var next_tick := int(runtime_state["root"]["tick"]) + 1
	var fixed_tick_hz := int(runtime_state["root"]["fixed_tick_hz"])
	return {
		"tick": next_tick,
		"time_sec": float(next_tick) / float(fixed_tick_hz),
		"input_type": input_type,
		"input_value": input_value,
		"input_source": "keyboard"
	}


func _drain_queued_input_records() -> Array:
	var records := _queued_input_records.duplicate(true)
	_queued_input_records = []
	return records


func _adjacent_speed_level(direction: int) -> String:
	var current_level := str(runtime_state["ownship"]["speed_level"])
	var levels: Array = scenario["ownship"]["speed_levels"]
	var current_index := 0
	for index in range(levels.size()):
		if levels[index].get("id") == current_level:
			current_index = index
			break
	var next_index: int = clamp(current_index + direction, 0, levels.size() - 1)
	return str(levels[next_index]["id"])


func _draw() -> void:
	if scenario.is_empty() or runtime_snapshot.is_empty():
		return

	draw_rect(Rect2(Vector2.ZERO, get_viewport_rect().size), Color(0.06, 0.12, 0.16))
	_draw_polygon_world(scenario["geometry"]["safe_corridor_polygon"], Color(0.07, 0.34, 0.43, 0.78), Color(0.56, 0.9, 0.94, 0.95), 4.0)
	for shallow in scenario["geometry"]["shallow_zone_polygons"]:
		_draw_polygon_world(shallow, Color(0.38, 0.31, 0.13, 0.74), Color(0.92, 0.68, 0.22, 0.9), 3.0)
		_draw_hatch_world(shallow, Color(0.98, 0.76, 0.3, 0.25))
	_draw_caution_buffer_guides()
	_draw_finish_gate()
	_draw_marks()
	_draw_target()
	_draw_ownship()


func _draw_polygon_world(points: Array, fill_color: Color, outline_color: Color, outline_width: float) -> void:
	var polygon := PackedVector2Array()
	for point in points:
		polygon.append(_world_to_screen(point))
	draw_colored_polygon(polygon, fill_color)
	for index in range(polygon.size()):
		draw_line(polygon[index], polygon[(index + 1) % polygon.size()], outline_color, outline_width)


func _draw_finish_gate() -> void:
	var finish_gate: Array = scenario["geometry"]["finish_gate"]
	var start := _world_to_screen(finish_gate[0])
	var end := _world_to_screen(finish_gate[1])
	draw_line(start, end, Color(0.98, 0.92, 0.35), 5.0)
	draw_circle(start, 5.5, Color(0.98, 0.92, 0.35))
	draw_circle(end, 5.5, Color(0.98, 0.92, 0.35))


func _draw_marks() -> void:
	for mark in scenario["marks"]:
		var position := _world_to_screen(mark["position"])
		var color := Color(0.86, 0.18, 0.15) if mark.get("side") == "port" else Color(0.12, 0.72, 0.28)
		draw_circle(position, 12.0, Color(color.r, color.g, color.b, 0.25))
		if mark.get("side") == "port":
			draw_rect(Rect2(position - Vector2(6.0, 6.0), Vector2(12.0, 12.0)), color)
		else:
			var triangle := PackedVector2Array([
				position + Vector2(0.0, -8.0),
				position + Vector2(7.0, 6.0),
				position + Vector2(-7.0, 6.0)
			])
			draw_colored_polygon(triangle, color)
		draw_circle(position, 3.0, Color(0.95, 0.95, 0.9))


func _draw_ownship() -> void:
	var ownship: Dictionary = runtime_snapshot["ownship"]
	var position := _world_to_screen(ownship["position_m"])
	draw_circle(position, float(ownship["collision_radius_m"]) * 0.9, _ownship_status_ring_color())
	draw_circle(position, 9.0, Color(0.95, 0.96, 0.88))
	draw_line(position, _world_to_screen(_project_position(ownship["position_m"], float(ownship["heading_deg"]), 36.0)), Color(0.95, 0.96, 0.88), 4.0)
	if ownship["projected_vector_end_m"] != null:
		draw_line(position, _world_to_screen(ownship["projected_vector_end_m"]), Color(0.72, 0.95, 1.0, 0.65), 2.0)
	for track_point in ownship["recent_track_m"]:
		draw_circle(_world_to_screen(track_point), 2.5, Color(0.95, 0.96, 0.88, 0.35))


func _draw_target() -> void:
	var target: Dictionary = runtime_snapshot["target"]
	var position := _world_to_screen(target["position_m"])
	draw_circle(position, 12.0, Color(0.95, 0.58, 0.18, 0.24))
	draw_circle(position, 8.0, Color(0.95, 0.58, 0.18))
	draw_line(position, _world_to_screen(_project_position(target["position_m"], float(target["heading_deg"]), 24.0)), Color(0.95, 0.58, 0.18), 3.0)
	if target["vector_end_position_m"] != null:
		var vector_end := _world_to_screen(target["vector_end_position_m"])
		draw_line(position, vector_end, Color(0.98, 0.74, 0.18, 0.82), 3.0)
		draw_circle(vector_end, 4.5, Color(0.98, 0.74, 0.18, 0.82))


func _project_position(position: Array, heading_deg: float, distance_m: float) -> Array:
	var heading_rad := deg_to_rad(heading_deg)
	return [
		float(position[0]) + sin(heading_rad) * distance_m,
		float(position[1]) + cos(heading_rad) * distance_m
	]


func _world_to_screen(world_position: Array) -> Vector2:
	var ownship_position: Array = runtime_snapshot["ownship"]["position_m"]
	var heading_deg := float(runtime_snapshot["ownship"]["heading_deg"])
	var heading_rad := deg_to_rad(heading_deg)
	var forward := Vector2(sin(heading_rad), cos(heading_rad))
	var right := Vector2(cos(heading_rad), -sin(heading_rad))
	var relative := Vector2(float(world_position[0]) - float(ownship_position[0]), float(world_position[1]) - float(ownship_position[1]))
	var anchor := _ownship_screen_anchor()
	return anchor + Vector2(relative.dot(right), -relative.dot(forward)) * VIEW_SCALE


func _ownship_screen_anchor() -> Vector2:
	var viewport_size := get_viewport_rect().size
	var anchor_source: Array = OWNERSHIP_ANCHOR_FALLBACK
	if not scenario.is_empty() and scenario.has("camera"):
		anchor_source = scenario["camera"].get("ownship_screen_anchor", OWNERSHIP_ANCHOR_FALLBACK)
	return Vector2(viewport_size.x * float(anchor_source[0]), viewport_size.y * float(anchor_source[1]))


func _update_hud() -> void:
	_layout_hud()
	if not last_loader_error.is_empty():
		_hud_sections = {
			"instrument_strip": "Loader error: %s" % last_loader_error.get("code", "unknown")
		}
		_apply_hud_sections()
		return
	if runtime_snapshot.is_empty():
		_hud_sections = _hud_binder.build_sections({})
		_apply_hud_sections()
		return

	_hud_sections = _hud_binder.build_sections(runtime_snapshot, local_attempt_state, scenario_result_detail)
	_apply_hud_sections()


func _apply_hud_sections() -> void:
	_update_scenario_selector_ui()
	if _hud_label != null:
		_hud_label.text = str(_hud_sections.get("instrument_strip", ""))
	if _warning_stack_label != null:
		_warning_stack_label.text = str(_hud_sections.get("warning_stack", ""))
	if _result_status_label != null:
		_result_status_label.text = str(_hud_sections.get("result_status", ""))
	if _attempt_status_label != null:
		_attempt_status_label.text = str(_hud_sections.get("attempt_status", ""))
	if _captain_report_label != null:
		_captain_report_label.text = str(_hud_sections.get("captain_report", ""))
		_captain_report_label.visible = local_attempt_state == "completed"
	if _briefing_panel_label != null:
		_briefing_panel_label.text = str(_hud_sections.get("briefing", ""))
		_briefing_panel_label.visible = local_attempt_state == "ready" and last_loader_error.is_empty()
	if _result_feedback_label != null:
		_result_feedback_label.text = str(_hud_sections.get("result_feedback", ""))
		_result_feedback_label.visible = local_attempt_state == "completed" and str(_hud_sections.get("result_feedback", "")) != ""
	if _coaching_rail_label != null:
		_coaching_rail_label.text = str(_hud_sections.get("decision_coaching", ""))
		_coaching_rail_label.visible = local_attempt_state == "running" and str(_hud_sections.get("decision_coaching", "")) != ""
	if _debug_status_label != null:
		_debug_status_label.text = str(_hud_sections.get("debug_status", ""))
	if _cue_legend_label != null:
		_cue_legend_label.text = str(_hud_sections.get("cue_legend", ""))
	if _instructions_label != null:
		_instructions_label.text = str(_hud_sections.get("controls", HudSnapshotBinder.CONTROLS_TEXT))


func _layout_hud() -> void:
	var viewport_size := get_viewport_rect().size
	if _hud_label != null:
		_hud_label.position = Vector2(12.0, 12.0)
		_hud_label.size = Vector2(390.0, 124.0)
	if _scenario_selector != null:
		_scenario_selector.position = Vector2(420.0, 12.0)
		_scenario_selector.size = Vector2(min(340.0, max(260.0, viewport_size.x - 880.0)), 30.0)
	if _scenario_selector_status_label != null:
		_scenario_selector_status_label.position = Vector2(420.0, 48.0)
		_scenario_selector_status_label.size = Vector2(min(400.0, max(300.0, viewport_size.x - 860.0)), 56.0)
	if _warning_stack_label != null:
		_warning_stack_label.position = Vector2(max(420.0, viewport_size.x - 410.0), 12.0)
		_warning_stack_label.size = Vector2(398.0, 92.0)
	if _result_status_label != null:
		_result_status_label.position = Vector2(max(420.0, viewport_size.x - 410.0), 112.0)
		_result_status_label.size = Vector2(398.0, 106.0)
	if _attempt_status_label != null:
		_attempt_status_label.position = Vector2(max(420.0, viewport_size.x - 410.0), 226.0)
		_attempt_status_label.size = Vector2(398.0, 90.0)
	if _captain_report_label != null:
		_captain_report_label.position = Vector2(max(420.0, viewport_size.x - 410.0), 324.0)
		_captain_report_label.size = Vector2(398.0, 138.0)
	if _briefing_panel_label != null:
		_briefing_panel_label.position = Vector2(max(16.0, viewport_size.x * 0.18), max(56.0, viewport_size.y * 0.08))
		_briefing_panel_label.size = Vector2(min(760.0, viewport_size.x * 0.64), min(520.0, viewport_size.y * 0.74))
	if _result_feedback_label != null:
		_result_feedback_label.position = Vector2(max(18.0, viewport_size.x * 0.22), max(72.0, viewport_size.y * 0.12))
		_result_feedback_label.size = Vector2(min(700.0, viewport_size.x * 0.56), min(420.0, viewport_size.y * 0.62))
	if _coaching_rail_label != null:
		_coaching_rail_label.position = Vector2(12.0, 142.0)
		_coaching_rail_label.size = Vector2(min(600.0, viewport_size.x - 432.0), 58.0)
	if _debug_status_label != null:
		_debug_status_label.position = Vector2(12.0, max(250.0, viewport_size.y - 132.0))
		_debug_status_label.size = Vector2(540.0, 120.0)
	if _cue_legend_label != null:
		_cue_legend_label.position = Vector2(12.0, max(210.0, viewport_size.y - 170.0))
		_cue_legend_label.size = Vector2(min(900.0, viewport_size.x - 24.0), 30.0)
	if _instructions_label != null:
		_instructions_label.position = Vector2(12.0, max(570.0, viewport_size.y - 36.0))
		_instructions_label.size = Vector2(min(980.0, viewport_size.x - 24.0), 26.0)


func _draw_hatch_world(points: Array, color: Color) -> void:
	var screen_points := PackedVector2Array()
	for point in points:
		screen_points.append(_world_to_screen(point))
	var bounds := Rect2(screen_points[0], Vector2.ZERO)
	for point in screen_points:
		bounds = bounds.expand(point)
	var step := 18.0
	var x := bounds.position.x - bounds.size.y
	while x < bounds.position.x + bounds.size.x + bounds.size.y:
		draw_line(Vector2(x, bounds.position.y), Vector2(x + bounds.size.y, bounds.position.y + bounds.size.y), color, 1.0)
		x += step


func _draw_caution_buffer_guides() -> void:
	var buffer_m := float(scenario["geometry"]["caution_buffers"]["safe_corridor_edge_m"])
	if buffer_m <= 0.0:
		return
	var corridor: Array = scenario["geometry"]["safe_corridor_polygon"]
	for index in range(corridor.size()):
		draw_line(_world_to_screen(corridor[index]), _world_to_screen(corridor[(index + 1) % corridor.size()]), Color(0.98, 0.7, 0.16, 0.34), max(1.0, buffer_m * 0.45))


func _ownship_status_ring_color() -> Color:
	var primary_warning: Variant = runtime_snapshot["warnings"]["primary_warning"]
	if primary_warning == null:
		return Color(0.72, 0.95, 1.0, 0.2)
	var warning_dict: Dictionary = primary_warning
	match str(warning_dict.get("severity", "")):
		"immediate":
			return Color(1.0, 0.18, 0.12, 0.6)
		"danger":
			return Color(1.0, 0.28, 0.12, 0.48)
		"caution":
			return Color(1.0, 0.72, 0.16, 0.42)
	return Color(0.72, 0.95, 1.0, 0.2)


func _is_terminal_result(state: String) -> bool:
	return TERMINAL_RESULT_STATES.has(state)


func _setup_scenario_selector() -> void:
	if _scenario_selector == null:
		return
	_scenario_selector.clear()
	for index in range(LOCAL_SCENARIO_OPTIONS.size()):
		var option: Dictionary = LOCAL_SCENARIO_OPTIONS[index]
		_scenario_selector.add_item(str(option["title"]), index)
	if not _scenario_selector.item_selected.is_connected(_on_scenario_selector_item_selected):
		_scenario_selector.item_selected.connect(_on_scenario_selector_item_selected)
	_sync_scenario_selector_selection()


func _on_scenario_selector_item_selected(index: int) -> void:
	select_scenario_index(index)


func _sync_scenario_selector_selection() -> void:
	if _scenario_selector == null:
		return
	var index: int = clamp(_scenario_index_for_path(_scenario_path), 0, LOCAL_SCENARIO_OPTIONS.size() - 1)
	if _scenario_selector.selected != index:
		_scenario_selector.select(index)
	_update_scenario_selector_ui()


func _update_scenario_selector_ui() -> void:
	var selector_visible: bool = local_attempt_state != "running"
	if _scenario_selector != null:
		_scenario_selector.visible = selector_visible
	if _scenario_selector_status_label != null:
		_scenario_selector_status_label.visible = selector_visible
		var option: Dictionary = LOCAL_SCENARIO_OPTIONS[_selected_scenario_index]
		_scenario_selector_status_label.text = "%s\nNot final maritime instruction." % str(option["status"])


func _scenario_index_for_path(path: String) -> int:
	for index in range(LOCAL_SCENARIO_OPTIONS.size()):
		var option: Dictionary = LOCAL_SCENARIO_OPTIONS[index]
		if str(option["path"]) == path:
			return index
	return 0
