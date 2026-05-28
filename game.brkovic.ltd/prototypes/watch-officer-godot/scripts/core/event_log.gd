extends RefCounted

class_name EventLog

var run_id := ""
var scenario_id := ""
var scenario_version := ""
var engine_version := ""
var seed := 0
var fixed_tick_hz := 0
var events: Array = []


func configure(context: Dictionary) -> void:
	run_id = context.get("run_id", "")
	scenario_id = context.get("scenario_id", "")
	scenario_version = context.get("scenario_version", "")
	engine_version = context.get("engine_version", "")
	seed = int(context.get("seed", 0))
	fixed_tick_hz = int(context.get("fixed_tick_hz", 0))


func append_event(event_type: String, payload: Dictionary, tick := 0, time_sec := 0.0) -> Dictionary:
	var event := {
		"run_id": run_id,
		"scenario_id": scenario_id,
		"scenario_version": scenario_version,
		"engine_version": engine_version,
		"seed": seed,
		"fixed_tick_hz": fixed_tick_hz,
		"tick": tick,
		"time_sec": time_sec,
		"type": event_type,
		"payload": payload.duplicate(true)
	}
	events.append(event)
	return event


func finalize(final_result: String) -> Dictionary:
	return append_event("event_log_finalized", {
		"event_count": events.size() + 1,
		"final_result": final_result
	})


func get_events() -> Array:
	return events.duplicate(true)


func get_event_types() -> Array:
	var event_types := []
	for event in events:
		event_types.append(event.get("type"))
	return event_types
