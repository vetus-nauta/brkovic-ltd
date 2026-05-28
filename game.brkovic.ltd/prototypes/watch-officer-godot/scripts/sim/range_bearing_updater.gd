extends RefCounted

class_name RangeBearingUpdater


func update_target_geometry(ownship: Dictionary, target: Dictionary) -> Dictionary:
	var updated_target := target.duplicate(true)
	var ownship_position: Array = ownship["position_m"]
	var target_position: Array = target["position_m"]
	var dx := float(target_position[0]) - float(ownship_position[0])
	var dy := float(target_position[1]) - float(ownship_position[1])
	var bearing_true := _bearing_from_delta(dx, dy)
	var relative_bearing := _relative_bearing(bearing_true, float(ownship["heading_deg"]))

	updated_target["range_m"] = sqrt(dx * dx + dy * dy)
	updated_target["bearing_true_deg"] = bearing_true
	updated_target["relative_bearing_deg"] = relative_bearing
	updated_target["relative_side"] = _relative_side(relative_bearing)
	return updated_target


func _bearing_from_delta(dx: float, dy: float) -> float:
	return fposmod(rad_to_deg(atan2(dx, dy)), 360.0)


func _relative_bearing(bearing_true_deg: float, ownship_heading_deg: float) -> float:
	return fposmod(bearing_true_deg - ownship_heading_deg, 360.0)


func _relative_side(relative_bearing_deg: float) -> String:
	if relative_bearing_deg <= 10.0 or relative_bearing_deg >= 350.0:
		return "ahead"
	if relative_bearing_deg >= 170.0 and relative_bearing_deg <= 190.0:
		return "astern"
	if relative_bearing_deg > 10.0 and relative_bearing_deg < 170.0:
		return "starboard"
	if relative_bearing_deg > 190.0 and relative_bearing_deg < 350.0:
		return "port"
	return "ambiguous"
