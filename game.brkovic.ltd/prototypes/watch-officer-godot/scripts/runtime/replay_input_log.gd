extends RefCounted

class_name ReplayInputLog

var log := {}


func build_empty(scenario: Dictionary) -> Dictionary:
	log = {
		"scenario_id": scenario["scenario_id"],
		"scenario_version": scenario["scenario_version"],
		"seed": scenario["replay"]["seed"],
		"fixed_tick_hz": scenario["replay"]["fixed_tick_hz"],
		"event_timing_tolerance_ticks": scenario["replay"]["event_timing_tolerance_ticks"],
		"inputs": []
	}
	return get_log()


func configure_from_log(source_log: Dictionary) -> void:
	log = source_log.duplicate(true)


func append_input(tick: int, time_sec: float, input_type: String, input_value: Variant, input_source: String) -> Dictionary:
	var record := {
		"tick": tick,
		"time_sec": time_sec,
		"input_type": input_type,
		"input_value": input_value,
		"input_source": input_source
	}
	log["inputs"].append(record)
	return record.duplicate(true)


func get_inputs() -> Array:
	return log.get("inputs", []).duplicate(true)


func get_inputs_for_tick(target_tick: int) -> Array:
	var records := []
	for record in log.get("inputs", []):
		if record.get("tick") == target_tick:
			records.append(record.duplicate(true))
	return records


func get_log() -> Dictionary:
	return log.duplicate(true)
