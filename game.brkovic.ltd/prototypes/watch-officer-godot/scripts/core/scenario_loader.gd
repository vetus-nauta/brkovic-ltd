extends RefCounted

class_name ScenarioLoader

const ERR_FILE_NOT_FOUND := "SCENARIO_FILE_NOT_FOUND"
const ERR_JSON_PARSE := "SCENARIO_JSON_PARSE_ERROR"
const ERR_FIELD_REQUIRED := "SCENARIO_FIELD_REQUIRED"
const ERR_IALA_REGION_UNSUPPORTED := "SCENARIO_IALA_REGION_UNSUPPORTED"
const ERR_RULE_REVIEW_STATUS_INVALID := "SCENARIO_RULE_REVIEW_STATUS_INVALID"
const ERR_VTS_MUST_BE_DISABLED := "SCENARIO_VTS_MUST_BE_DISABLED"
const ERR_VTS_PROMPTS_NOT_ALLOWED := "SCENARIO_VTS_PROMPTS_NOT_ALLOWED"
const ERR_TARGET_COUNT_INVALID := "SCENARIO_TARGET_COUNT_INVALID"
const ERR_TARGET_CROSSING_SIDE_INVALID := "SCENARIO_TARGET_CROSSING_SIDE_INVALID"
const ERR_TARGET_HEADING_RELATION_INVALID := "SCENARIO_TARGET_HEADING_RELATION_INVALID"
const ERR_LATERAL_PAIR_INVALID := "SCENARIO_LATERAL_PAIR_INVALID"
const ERR_MARK_REGION_INVALID := "SCENARIO_MARK_REGION_INVALID"
const ERR_GEOMETRY_REQUIRED := "SCENARIO_GEOMETRY_REQUIRED"
const ERR_ENCOUNTER_CONTRACT_INVALID := "SCENARIO_ENCOUNTER_CONTRACT_INVALID"
const ERR_REPLAY_METADATA_REQUIRED := "SCENARIO_REPLAY_METADATA_REQUIRED"
const ERR_REPLAY_TOLERANCE_INVALID := "SCENARIO_REPLAY_TOLERANCE_INVALID"

const SCENARIO_SAFE_WATER_CROSSING := "safe-water-crossing-target"
const SCENARIO_HEAD_ON_PORT_TO_PORT := "head-on-port-to-port"
const ALLOWED_SCENARIO_IDS := [SCENARIO_SAFE_WATER_CROSSING, SCENARIO_HEAD_ON_PORT_TO_PORT]
const EXPECTED_TRAINING_CLAIM_STATUS := "draft_not_final_training_content"
const EXPECTED_QUALITATIVE_STATES := ["safe", "caution", "danger", "immediate"]

const REQUIRED_TOP_LEVEL_FIELDS := [
	"schema_version",
	"scenario_id",
	"scenario_version",
	"rule_review_status",
	"training_claim_status",
	"iala_region",
	"ownship",
	"target_vessels",
	"marks",
	"geometry",
	"encounter",
	"cpa_tcpa",
	"vts",
	"replay"
]

var last_error := {}


func load_scenario(scenario_path: String) -> Dictionary:
	last_error = {}

	if not FileAccess.file_exists(scenario_path):
		last_error = _make_error(ERR_FILE_NOT_FOUND, "loader.error.file_not_found", scenario_path, "$", "existing file", scenario_path)
		return {}

	var raw_json := FileAccess.get_file_as_string(scenario_path)
	var parser := JSON.new()
	var parse_result := parser.parse(raw_json)
	if parse_result != OK:
		last_error = _make_error(ERR_JSON_PARSE, "loader.error.json_parse", scenario_path, "$", "valid json", parser.get_error_message())
		return {}

	if typeof(parser.data) != TYPE_DICTIONARY:
		last_error = _make_error(ERR_JSON_PARSE, "loader.error.json_root", scenario_path, "$", "object", typeof(parser.data))
		return {}

	return validate_scenario(parser.data, scenario_path)


func validate_scenario(scenario_data: Dictionary, scenario_path := "") -> Dictionary:
	last_error = {}

	var validation_error := _validate_scenario_data(scenario_data, scenario_path)
	if not validation_error.is_empty():
		last_error = validation_error
		return {}

	return scenario_data.duplicate(true)


func _validate_scenario_data(data: Dictionary, scenario_path: String) -> Dictionary:
	for field in REQUIRED_TOP_LEVEL_FIELDS:
		if not data.has(field):
			return _make_error(ERR_FIELD_REQUIRED, "loader.error.field_required", scenario_path, "$.%s" % field, "present", null)

	var scenario_id: String = data["scenario_id"]
	if not ALLOWED_SCENARIO_IDS.has(scenario_id):
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.scenario_id_invalid", scenario_path, "$.scenario_id", ALLOWED_SCENARIO_IDS, data["scenario_id"])

	if data["iala_region"] != "A":
		return _make_error(ERR_IALA_REGION_UNSUPPORTED, "loader.error.iala_region_unsupported", scenario_path, "$.iala_region", "A", data["iala_region"])

	if data["rule_review_status"] != "draft":
		return _make_error(ERR_RULE_REVIEW_STATUS_INVALID, "loader.error.rule_review_status_invalid", scenario_path, "$.rule_review_status", "draft", data["rule_review_status"])

	if data["training_claim_status"] != EXPECTED_TRAINING_CLAIM_STATUS:
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.training_claim_status_invalid", scenario_path, "$.training_claim_status", EXPECTED_TRAINING_CLAIM_STATUS, data["training_claim_status"])

	var vts_error := _validate_vts(data["vts"], scenario_path)
	if not vts_error.is_empty():
		return vts_error

	var encounter_error := _validate_encounter(data["encounter"], scenario_id, scenario_path)
	if not encounter_error.is_empty():
		return encounter_error

	var target_error := _validate_targets(data["target_vessels"], scenario_id, scenario_path)
	if not target_error.is_empty():
		return target_error

	var marks_error := _validate_marks(data["marks"], scenario_id, scenario_path)
	if not marks_error.is_empty():
		return marks_error

	var geometry_error := _validate_geometry(data["geometry"], scenario_path)
	if not geometry_error.is_empty():
		return geometry_error

	var cpa_error := _validate_cpa_tcpa(data["cpa_tcpa"], scenario_path)
	if not cpa_error.is_empty():
		return cpa_error

	var replay_error := _validate_replay(data["replay"], scenario_path)
	if not replay_error.is_empty():
		return replay_error

	return {}


func _validate_vts(vts: Variant, scenario_path: String) -> Dictionary:
	if typeof(vts) != TYPE_DICTIONARY:
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.field_required", scenario_path, "$.vts", "object", typeof(vts))
	if not vts.has("enabled"):
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.field_required", scenario_path, "$.vts.enabled", false, null)
	if vts["enabled"] != false:
		return _make_error(ERR_VTS_MUST_BE_DISABLED, "loader.error.vts_must_be_disabled", scenario_path, "$.vts.enabled", false, vts["enabled"])
	if not vts.has("prompts"):
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.field_required", scenario_path, "$.vts.prompts", [], null)
	if typeof(vts["prompts"]) != TYPE_ARRAY or not vts["prompts"].is_empty():
		return _make_error(ERR_VTS_PROMPTS_NOT_ALLOWED, "loader.error.vts_prompts_not_allowed", scenario_path, "$.vts.prompts", [], vts["prompts"])
	return {}


func _validate_targets(targets: Variant, scenario_id: String, scenario_path: String) -> Dictionary:
	if typeof(targets) != TYPE_ARRAY or targets.size() != 1:
		return _make_error(ERR_TARGET_COUNT_INVALID, "loader.error.target_count_invalid", scenario_path, "$.target_vessels", 1, _size_or_type(targets))

	var target = targets[0]
	if typeof(target) != TYPE_DICTIONARY:
		return _make_error(ERR_TARGET_COUNT_INVALID, "loader.error.target_invalid", scenario_path, "$.target_vessels[0]", "object", typeof(target))
	if target.get("type") != "power_driven":
		return _make_error(ERR_TARGET_COUNT_INVALID, "loader.error.target_type_invalid", scenario_path, "$.target_vessels[0].type", "power_driven", target.get("type"))
	if target.get("behaviour") != "constant_course_speed":
		return _make_error(ERR_TARGET_COUNT_INVALID, "loader.error.target_behaviour_invalid", scenario_path, "$.target_vessels[0].behaviour", "constant_course_speed", target.get("behaviour"))
	if scenario_id == SCENARIO_SAFE_WATER_CROSSING and target.get("crossing_from") != "starboard":
		return _make_error(ERR_TARGET_CROSSING_SIDE_INVALID, "loader.error.target_crossing_side_invalid", scenario_path, "$.target_vessels[0].crossing_from", "starboard", target.get("crossing_from"))
	if scenario_id == SCENARIO_HEAD_ON_PORT_TO_PORT and target.get("heading_relation") != "reciprocal_or_nearly_reciprocal":
		return _make_error(ERR_TARGET_HEADING_RELATION_INVALID, "loader.error.target_heading_relation_invalid", scenario_path, "$.target_vessels[0].heading_relation", "reciprocal_or_nearly_reciprocal", target.get("heading_relation"))

	var ais = target.get("ais")
	if typeof(ais) != TYPE_DICTIONARY or not ais.has("vector_horizon_sec") or float(ais["vector_horizon_sec"]) <= 0.0:
		return _make_error(ERR_TARGET_COUNT_INVALID, "loader.error.target_ais_invalid", scenario_path, "$.target_vessels[0].ais.vector_horizon_sec", "positive number", ais)
	return {}


func _validate_marks(marks: Variant, scenario_id: String, scenario_path: String) -> Dictionary:
	if typeof(marks) != TYPE_ARRAY:
		return _make_error(ERR_LATERAL_PAIR_INVALID, "loader.error.lateral_pair_invalid", scenario_path, "$.marks", "array", typeof(marks))

	if scenario_id == SCENARIO_HEAD_ON_PORT_TO_PORT:
		for index in range(marks.size()):
			var mark = marks[index]
			if typeof(mark) != TYPE_DICTIONARY:
				return _make_error(ERR_LATERAL_PAIR_INVALID, "loader.error.mark_invalid", scenario_path, "$.marks[%s]" % index, "object", typeof(mark))
			if mark.get("iala_region") != "A":
				return _make_error(ERR_MARK_REGION_INVALID, "loader.error.mark_region_invalid", scenario_path, "$.marks[%s].iala_region" % index, "A", mark.get("iala_region"))
		return {}

	var port_count := 0
	var starboard_count := 0
	for index in range(marks.size()):
		var mark = marks[index]
		if typeof(mark) != TYPE_DICTIONARY:
			return _make_error(ERR_LATERAL_PAIR_INVALID, "loader.error.mark_invalid", scenario_path, "$.marks[%s]" % index, "object", typeof(mark))
		if mark.get("iala_region") != "A":
			return _make_error(ERR_MARK_REGION_INVALID, "loader.error.mark_region_invalid", scenario_path, "$.marks[%s].iala_region" % index, "A", mark.get("iala_region"))
		if mark.get("type") == "lateral" and mark.get("side") == "port" and mark.get("colour") == "red":
			port_count += 1
		if mark.get("type") == "lateral" and mark.get("side") == "starboard" and mark.get("colour") == "green":
			starboard_count += 1

	if port_count != 1 or starboard_count != 1:
		return _make_error(ERR_LATERAL_PAIR_INVALID, "loader.error.lateral_pair_invalid", scenario_path, "$.marks", "one Region A port red and one Region A starboard green lateral mark", {"port": port_count, "starboard": starboard_count})
	return {}


func _validate_encounter(encounter: Variant, scenario_id: String, scenario_path: String) -> Dictionary:
	if typeof(encounter) != TYPE_DICTIONARY:
		return _make_error(ERR_ENCOUNTER_CONTRACT_INVALID, "loader.error.encounter_required", scenario_path, "$.encounter", "object", typeof(encounter))
	if typeof(encounter.get("classifier_thresholds")) != TYPE_DICTIONARY:
		return _make_error(ERR_ENCOUNTER_CONTRACT_INVALID, "loader.error.classifier_thresholds_required", scenario_path, "$.encounter.classifier_thresholds", "object", encounter.get("classifier_thresholds"))

	if scenario_id == SCENARIO_SAFE_WATER_CROSSING:
		if encounter.get("expected_initial_class") != "crossing":
			return _make_error(ERR_ENCOUNTER_CONTRACT_INVALID, "loader.error.encounter_class_invalid", scenario_path, "$.encounter.expected_initial_class", "crossing", encounter.get("expected_initial_class"))
		if encounter.get("expected_player_role") != "give_way":
			return _make_error(ERR_ENCOUNTER_CONTRACT_INVALID, "loader.error.player_role_invalid", scenario_path, "$.encounter.expected_player_role", "give_way", encounter.get("expected_player_role"))
		return _require_thresholds(encounter["classifier_thresholds"], [
			"head_on_relative_heading_deg",
			"crossing_min_bearing_deg",
			"crossing_max_bearing_deg",
			"overtaking_abaft_beam_deg",
			"ambiguous_margin_deg"
		], scenario_path)

	if scenario_id == SCENARIO_HEAD_ON_PORT_TO_PORT:
		if encounter.get("expected_initial_class") != "head_on":
			return _make_error(ERR_ENCOUNTER_CONTRACT_INVALID, "loader.error.encounter_class_invalid", scenario_path, "$.encounter.expected_initial_class", "head_on", encounter.get("expected_initial_class"))
		if encounter.get("expected_player_role") != "head_on_alter_starboard":
			return _make_error(ERR_ENCOUNTER_CONTRACT_INVALID, "loader.error.player_role_invalid", scenario_path, "$.encounter.expected_player_role", "head_on_alter_starboard", encounter.get("expected_player_role"))
		return _require_thresholds(encounter["classifier_thresholds"], [
			"head_on_relative_heading_deg",
			"head_on_bearing_ahead_tolerance_deg",
			"ambiguous_margin_deg"
		], scenario_path)

	return _make_error(ERR_FIELD_REQUIRED, "loader.error.scenario_id_invalid", scenario_path, "$.scenario_id", ALLOWED_SCENARIO_IDS, scenario_id)


func _require_thresholds(thresholds: Dictionary, names: Array, scenario_path: String) -> Dictionary:
	for name in names:
		if not thresholds.has(name):
			return _make_error(ERR_ENCOUNTER_CONTRACT_INVALID, "loader.error.classifier_threshold_required", scenario_path, "$.encounter.classifier_thresholds.%s" % name, "present", null)
		if typeof(thresholds[name]) != TYPE_INT and typeof(thresholds[name]) != TYPE_FLOAT:
			return _make_error(ERR_ENCOUNTER_CONTRACT_INVALID, "loader.error.classifier_threshold_invalid", scenario_path, "$.encounter.classifier_thresholds.%s" % name, "number", thresholds[name])
	return {}


func _validate_geometry(geometry: Variant, scenario_path: String) -> Dictionary:
	if typeof(geometry) != TYPE_DICTIONARY:
		return _make_error(ERR_GEOMETRY_REQUIRED, "loader.error.geometry_required", scenario_path, "$.geometry", "object", typeof(geometry))
	if not geometry.has("safe_corridor_polygon") or not _is_polygon(geometry["safe_corridor_polygon"]):
		return _make_error(ERR_GEOMETRY_REQUIRED, "loader.error.geometry_required", scenario_path, "$.geometry.safe_corridor_polygon", "polygon with at least 3 points", geometry.get("safe_corridor_polygon"))
	if not geometry.has("shallow_zone_polygons") or typeof(geometry["shallow_zone_polygons"]) != TYPE_ARRAY or geometry["shallow_zone_polygons"].is_empty():
		return _make_error(ERR_GEOMETRY_REQUIRED, "loader.error.geometry_required", scenario_path, "$.geometry.shallow_zone_polygons", "at least one polygon", geometry.get("shallow_zone_polygons"))
	for index in range(geometry["shallow_zone_polygons"].size()):
		if not _is_polygon(geometry["shallow_zone_polygons"][index]):
			return _make_error(ERR_GEOMETRY_REQUIRED, "loader.error.geometry_required", scenario_path, "$.geometry.shallow_zone_polygons[%s]" % index, "polygon with at least 3 points", geometry["shallow_zone_polygons"][index])
	if not geometry.has("caution_buffers") or typeof(geometry["caution_buffers"]) != TYPE_DICTIONARY:
		return _make_error(ERR_GEOMETRY_REQUIRED, "loader.error.geometry_required", scenario_path, "$.geometry.caution_buffers", "object", geometry.get("caution_buffers"))
	if not geometry["caution_buffers"].has("safe_corridor_edge_m") or not geometry["caution_buffers"].has("shallow_warning_m"):
		return _make_error(ERR_GEOMETRY_REQUIRED, "loader.error.geometry_required", scenario_path, "$.geometry.caution_buffers", "safe_corridor_edge_m and shallow_warning_m", geometry["caution_buffers"])
	if not geometry.has("finish_gate") or typeof(geometry["finish_gate"]) != TYPE_ARRAY or geometry["finish_gate"].size() != 2:
		return _make_error(ERR_GEOMETRY_REQUIRED, "loader.error.geometry_required", scenario_path, "$.geometry.finish_gate", "2 points", geometry.get("finish_gate"))
	return {}


func _validate_cpa_tcpa(cpa_tcpa: Variant, scenario_path: String) -> Dictionary:
	if typeof(cpa_tcpa) != TYPE_DICTIONARY:
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.cpa_tcpa_required", scenario_path, "$.cpa_tcpa", "object", typeof(cpa_tcpa))
	if cpa_tcpa.get("qualitative_states") != EXPECTED_QUALITATIVE_STATES:
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.cpa_states_invalid", scenario_path, "$.cpa_tcpa.qualitative_states", EXPECTED_QUALITATIVE_STATES, cpa_tcpa.get("qualitative_states"))
	if cpa_tcpa.get("numeric_debug_required") != true:
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.numeric_cpa_debug_required", scenario_path, "$.cpa_tcpa.numeric_debug_required", true, cpa_tcpa.get("numeric_debug_required"))
	var safe := float(cpa_tcpa.get("safe_cpa_m", -1))
	var caution := float(cpa_tcpa.get("caution_cpa_m", -1))
	var danger := float(cpa_tcpa.get("danger_cpa_m", -1))
	var immediate := float(cpa_tcpa.get("immediate_cpa_m", -1))
	if not (safe > caution and caution > danger and danger > immediate and immediate > 0.0):
		return _make_error(ERR_FIELD_REQUIRED, "loader.error.cpa_thresholds_invalid", scenario_path, "$.cpa_tcpa", "safe > caution > danger > immediate > 0", cpa_tcpa)
	return {}


func _validate_replay(replay: Variant, scenario_path: String) -> Dictionary:
	if typeof(replay) != TYPE_DICTIONARY:
		return _make_error(ERR_REPLAY_METADATA_REQUIRED, "loader.error.replay_metadata_required", scenario_path, "$.replay", "object", typeof(replay))
	if not replay.has("seed") or not _is_integer_number(replay["seed"]):
		return _make_error(ERR_REPLAY_METADATA_REQUIRED, "loader.error.replay_metadata_required", scenario_path, "$.replay.seed", "integer", replay.get("seed"))
	if not replay.has("fixed_tick_hz") or not _is_integer_number(replay["fixed_tick_hz"]) or replay["fixed_tick_hz"] <= 0:
		return _make_error(ERR_REPLAY_METADATA_REQUIRED, "loader.error.replay_metadata_required", scenario_path, "$.replay.fixed_tick_hz", "positive integer", replay.get("fixed_tick_hz"))
	if replay.get("input_log_required") != true:
		return _make_error(ERR_REPLAY_METADATA_REQUIRED, "loader.error.replay_metadata_required", scenario_path, "$.replay.input_log_required", true, replay.get("input_log_required"))
	if replay.get("event_log_required") != true:
		return _make_error(ERR_REPLAY_METADATA_REQUIRED, "loader.error.replay_metadata_required", scenario_path, "$.replay.event_log_required", true, replay.get("event_log_required"))
	if replay.get("event_timing_tolerance_ticks") != 1:
		return _make_error(ERR_REPLAY_TOLERANCE_INVALID, "loader.error.replay_tolerance_invalid", scenario_path, "$.replay.event_timing_tolerance_ticks", 1, replay.get("event_timing_tolerance_ticks"))
	return {}


func _is_polygon(value: Variant) -> bool:
	if typeof(value) != TYPE_ARRAY or value.size() < 3:
		return false
	for point in value:
		if typeof(point) != TYPE_ARRAY or point.size() != 2:
			return false
	return true


func _is_integer_number(value: Variant) -> bool:
	if typeof(value) == TYPE_INT:
		return true
	if typeof(value) == TYPE_FLOAT:
		return value == floor(value)
	return false


func _size_or_type(value: Variant) -> Variant:
	if typeof(value) == TYPE_ARRAY:
		return value.size()
	return typeof(value)


func _make_error(code: String, message_key: String, scenario_path: String, json_path: String, expected: Variant, actual: Variant) -> Dictionary:
	return {
		"code": code,
		"message_key": message_key,
		"scenario_path": scenario_path,
		"json_path": json_path,
		"expected": expected,
		"actual": actual,
		"blocking": true
	}
