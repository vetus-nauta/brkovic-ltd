extends RefCounted

class_name WarningEscalationPipeline

const PRIORITY_CPA_IMMEDIATE := 1
const PRIORITY_CPA_DANGER := 2
const PRIORITY_GEOMETRY_GROUNDED := 3
const PRIORITY_GEOMETRY_SHALLOW := 4
const PRIORITY_GEOMETRY_SHALLOW_BUFFER := 5
const PRIORITY_GEOMETRY_CORRIDOR_BUFFER := 6
const PRIORITY_CPA_CAUTION := 7


func build_queue(safe_water: Dictionary, cpa_tcpa: Dictionary, ownship: Dictionary, target: Dictionary, current_tick: int, previous_warnings: Dictionary = {}) -> Dictionary:
	var previous_by_id: Dictionary = _index_previous_warnings(previous_warnings)
	var candidates: Array = []

	var geometry_warning: Dictionary = _geometry_warning(safe_water, ownship, current_tick, previous_by_id)
	if not geometry_warning.is_empty():
		candidates.append(geometry_warning)

	var cpa_warning: Dictionary = _cpa_warning(cpa_tcpa, target, current_tick, previous_by_id)
	if not cpa_warning.is_empty():
		candidates.append(cpa_warning)

	var ordered_warnings: Array = _sort_warnings(_deduplicate(candidates))
	if ordered_warnings.is_empty():
		return {
			"primary_warning": null,
			"secondary_warnings": []
		}

	return {
		"primary_warning": ordered_warnings[0].duplicate(true),
		"secondary_warnings": ordered_warnings.slice(1).duplicate(true)
	}


func _geometry_warning(safe_water: Dictionary, ownship: Dictionary, current_tick: int, previous_by_id: Dictionary) -> Dictionary:
	var state: String = str(safe_water.get("state", "in_corridor"))
	match state:
		"corridor_buffer":
			return _make_warning(
				"geometry.leaving_safe_water",
				"warning.leaving_safe_water",
				"geometry",
				"caution",
				PRIORITY_GEOMETRY_CORRIDOR_BUFFER,
				str(ownship.get("id", "ownship")),
				ownship.get("position_m", null),
				current_tick,
				{
					"safe_water_state": state,
					"nearest_boundary_m_debug": safe_water.get("nearest_boundary_m_debug", 0.0),
					"active_zone_id": safe_water.get("active_zone_id", "")
				},
				previous_by_id
			)
		"shallow_buffer":
			return _make_warning(
				"geometry.shallow_water",
				"warning.shallow_water",
				"geometry",
				"caution",
				PRIORITY_GEOMETRY_SHALLOW_BUFFER,
				str(ownship.get("id", "ownship")),
				ownship.get("position_m", null),
				current_tick,
				{
					"safe_water_state": state,
					"nearest_boundary_m_debug": safe_water.get("nearest_boundary_m_debug", 0.0),
					"active_zone_id": safe_water.get("active_zone_id", "")
				},
				previous_by_id
			)
		"shallow":
			return _make_warning(
				"geometry.shallow_water",
				"warning.shallow_water",
				"geometry",
				"danger",
				PRIORITY_GEOMETRY_SHALLOW,
				str(ownship.get("id", "ownship")),
				ownship.get("position_m", null),
				current_tick,
				{
					"safe_water_state": state,
					"nearest_boundary_m_debug": safe_water.get("nearest_boundary_m_debug", 0.0),
					"active_zone_id": safe_water.get("active_zone_id", "")
				},
				previous_by_id
			)
		"grounded":
			return _make_warning(
				"geometry.grounding",
				"warning.grounding",
				"geometry",
				"immediate",
				PRIORITY_GEOMETRY_GROUNDED,
				str(ownship.get("id", "ownship")),
				ownship.get("position_m", null),
				current_tick,
				{
					"safe_water_state": state,
					"nearest_boundary_m_debug": safe_water.get("nearest_boundary_m_debug", 0.0),
					"active_zone_id": safe_water.get("active_zone_id", "")
				},
				previous_by_id
			)
	return {}


func _cpa_warning(cpa_tcpa: Dictionary, target: Dictionary, current_tick: int, previous_by_id: Dictionary) -> Dictionary:
	if not bool(cpa_tcpa.get("active", false)):
		return {}

	var state: String = str(cpa_tcpa.get("state", "safe"))
	var severity := ""
	var priority := 0
	match state:
		"caution":
			severity = "caution"
			priority = PRIORITY_CPA_CAUTION
		"danger":
			severity = "danger"
			priority = PRIORITY_CPA_DANGER
		"immediate":
			severity = "immediate"
			priority = PRIORITY_CPA_IMMEDIATE
		_:
			return {}

	return _make_warning(
		"cpa_tcpa.cpa_risk",
		"warning.cpa_risk",
		"cpa_tcpa",
		severity,
		priority,
		str(target.get("id", "target")),
		_spatial_anchor_for_cpa(cpa_tcpa, target),
		current_tick,
		{
			"cpa_tcpa_state": state,
			"cpa_m_debug": cpa_tcpa.get("cpa_m_debug", 0.0),
			"tcpa_sec_debug": cpa_tcpa.get("tcpa_sec_debug", 0.0),
			"active": cpa_tcpa.get("active", false)
		},
		previous_by_id
	)


func _make_warning(id: String, text_key: String, source: String, severity: String, priority: int, related_entity_id: String, spatial_anchor_value: Variant, current_tick: int, debug_payload: Dictionary, previous_by_id: Dictionary) -> Dictionary:
	var started_tick: int = current_tick
	if previous_by_id.has(id):
		var previous_warning: Dictionary = previous_by_id[id]
		if previous_warning.get("state") == "active":
			started_tick = int(previous_warning.get("started_tick", current_tick))

	return {
		"id": id,
		"state": "active",
		"severity": severity,
		"priority": priority,
		"text_key": text_key,
		"source": source,
		"related_entity_id": related_entity_id,
		"spatial_anchor_m": _duplicate_anchor(spatial_anchor_value),
		"started_tick": started_tick,
		"updated_tick": current_tick,
		"cleared_tick": null,
		"debug_payload": debug_payload.duplicate(true)
	}


func _spatial_anchor_for_cpa(cpa_tcpa: Dictionary, target: Dictionary) -> Variant:
	if cpa_tcpa.has("closest_point_target_m") and cpa_tcpa["closest_point_target_m"] != null:
		return cpa_tcpa["closest_point_target_m"]
	return target.get("position_m", null)


func _duplicate_anchor(spatial_anchor_value: Variant) -> Variant:
	if spatial_anchor_value == null:
		return null
	if spatial_anchor_value is Array:
		return spatial_anchor_value.duplicate(true)
	return spatial_anchor_value


func _index_previous_warnings(previous_warnings: Dictionary) -> Dictionary:
	var previous_by_id := {}
	var previous_items: Array = []
	var primary = previous_warnings.get("primary_warning", null)
	if primary != null:
		previous_items.append(primary)
	previous_items.append_array(previous_warnings.get("secondary_warnings", []))

	for item in previous_items:
		var warning: Dictionary = item
		var id: String = str(warning.get("id", ""))
		if id != "" and not previous_by_id.has(id):
			previous_by_id[id] = warning.duplicate(true)
	return previous_by_id


func _deduplicate(candidates: Array) -> Array:
	var by_id := {}
	for candidate in candidates:
		var warning: Dictionary = candidate
		var id: String = str(warning["id"])
		if not by_id.has(id):
			by_id[id] = warning
		else:
			var existing: Dictionary = by_id[id]
			if int(warning["priority"]) < int(existing["priority"]):
				by_id[id] = warning

	var deduplicated: Array = []
	for id in by_id.keys():
		deduplicated.append(by_id[id])
	return deduplicated


func _sort_warnings(warnings: Array) -> Array:
	var ordered: Array = warnings.duplicate(true)
	for i in range(ordered.size()):
		for j in range(i + 1, ordered.size()):
			var current: Dictionary = ordered[i]
			var challenger: Dictionary = ordered[j]
			if _warning_less_than(challenger, current):
				ordered[i] = challenger
				ordered[j] = current
	return ordered


func _warning_less_than(a: Dictionary, b: Dictionary) -> bool:
	var priority_a: int = int(a["priority"])
	var priority_b: int = int(b["priority"])
	if priority_a != priority_b:
		return priority_a < priority_b
	return str(a["id"]) < str(b["id"])
