extends RefCounted

class_name FixedTickClock

var fixed_tick_hz := 0
var tick := 0
var time_sec := 0.0


func configure(tick_hz: int) -> void:
	fixed_tick_hz = tick_hz
	tick = 0
	time_sec = 0.0


func advance_tick() -> Dictionary:
	tick += 1
	time_sec = float(tick) / float(fixed_tick_hz)
	return snapshot()


func advance_ticks(count: int) -> Array:
	var snapshots := []
	for _index in range(count):
		snapshots.append(advance_tick())
	return snapshots


func snapshot() -> Dictionary:
	return {
		"tick": tick,
		"time_sec": time_sec,
		"fixed_tick_hz": fixed_tick_hz
	}
