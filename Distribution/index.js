import { __extends } from "tslib";
// To know user activities
import { goals, today } from "user-activity";
import { me as appbit } from "appbit";
import { units } from "user-settings";
/***
 * All activities
 */
var Activities = /** @class */ (function () {
    function Activities() {
    }
    return Activities;
}());
export { Activities };
/**
 * Activity helper
 */
var Activity = /** @class */ (function () {
    // constructor
    function Activity(actual, goal) {
        this.actual = actual || 0;
        this.actualUndefined = actual === undefined;
        this.goal = goal || 0;
        this.goalUndefined = goal === undefined;
    }
    /**
     * Activity is undefined
     * (allways true when "access_activity" is not granted)
     */
    Activity.prototype.undefined = function () {
        return this.actualUndefined;
    };
    /**
     * Return true if the goal of this activity was reached.
     */
    Activity.prototype.goalReached = function () {
        return !this.actualUndefined && this.actual >= this.goal;
    };
    /**
     * Return this actual value as angle (0=0% and 360=100%)
     */
    Activity.prototype.as360Arc = function () {
        // Check to avoid calcul
        if (this.actualUndefined || this.goalUndefined
            || this.goal <= 0 || this.actual <= 0)
            return 0;
        if (this.actual >= this.goal)
            return 360;
        // Calcul
        return this.actual * 360 / this.goal;
    };
    /**
     * Return this actual progression as pourcentage
     */
    Activity.prototype.asPourcent = function () {
        // Check to avoid calcul
        if (this.actualUndefined || this.goalUndefined
            || this.goal <= 0 || this.actual <= 0)
            return 0;
        if (this.actual >= this.goal)
            return 100;
        // Calcul
        return this.actual * 100 / this.goal;
    };
    return Activity;
}());
export { Activity };
/**
 * ActiveZoneMinutes (properties "actual" and "goal" are defined with the total values)
 */
var ActiveZoneMinutesActivity = /** @class */ (function (_super) {
    __extends(ActiveZoneMinutesActivity, _super);
    function ActiveZoneMinutesActivity() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var _this = _super.call(this, (_a = today.adjusted.activeZoneMinutes) === null || _a === void 0 ? void 0 : _a.total, (_b = goals.activeZoneMinutes) === null || _b === void 0 ? void 0 : _b.total) || this;
        // today.adjusted.activeZoneMinutes, goals.activeZoneMinutes
        _this.cardio = new Activity((_c = today.local.activeZoneMinutes) === null || _c === void 0 ? void 0 : _c.cardio, (_d = goals.activeZoneMinutes) === null || _d === void 0 ? void 0 : _d.cardio);
        _this.fatBurn = new Activity((_e = today.local.activeZoneMinutes) === null || _e === void 0 ? void 0 : _e.fatBurn, (_f = goals.activeZoneMinutes) === null || _f === void 0 ? void 0 : _f.fatBurn);
        _this.peak = new Activity((_g = today.local.activeZoneMinutes) === null || _g === void 0 ? void 0 : _g.peak, (_h = goals.activeZoneMinutes) === null || _h === void 0 ? void 0 : _h.peak);
        return _this;
    }
    return ActiveZoneMinutesActivity;
}(Activity));
export { ActiveZoneMinutesActivity };
// Last values
var _lastActivities = new Activities();
// Call back to requestin interface update
var _callback;
// Detect limitations of versa light
var _elevationIsAvailable = appbit.permissions.granted("access_activity")
    && today.local.elevationGain !== undefined;
/**
 * Allow to detect elevation capacity on others device than versa light.
 */
export function elevationIsAvailable() {
    return _elevationIsAvailable;
}
/**
 * Initialize this helper.
 * @param callback : method use to notify the application when activities changed
 */
export function initialize(callback) {
    // Set call back
    _callback = callback;
    // use the Callback to init the app
    _callback();
}
// When goal is reached
goals.addEventListener("reachgoal", function () {
    if (_callback === undefined)
        return;
    _callback();
});
/**
 * Reset the last known state of activities.
 */
export function reset() {
    _lastActivities.activeZoneMinutes = undefined;
    _lastActivities.calories = undefined;
    _lastActivities.distance = undefined;
    _lastActivities.elevationGain = undefined;
    _lastActivities.steps = undefined;
}
/**
 * Return activities if updates and updated values form previous states (if requested)
 * Properties are undefined if the values haven't changed since the last call
 */
export function getNewValues() {
    // Init
    var result = new Activities();
    // Check permission
    if (!appbit.permissions.granted("access_activity")) {
        // Return empty activities
        var emptyActivity = new Activity(undefined, undefined);
        result.activeZoneMinutes = new ActiveZoneMinutesActivity();
        result.calories = emptyActivity;
        result.distance = emptyActivity;
        result.elevationGain = emptyActivity;
        result.steps = emptyActivity;
        return result;
    }
    // Get current acticities
    var steps = new Activity(today.adjusted.steps, goals.steps);
    var calories = new Activity(today.adjusted.calories, goals.calories);
    var activeZoneMinutes = new ActiveZoneMinutesActivity();
    var distance = getDistances();
    if (equals(steps, _lastActivities.steps)) {
        _lastActivities.steps = steps;
        result.steps = steps;
    }
    if (equals(calories, _lastActivities.calories)) {
        _lastActivities.calories = calories;
        result.calories = calories;
    }
    if (equals(activeZoneMinutes, _lastActivities.activeZoneMinutes)) {
        _lastActivities.activeZoneMinutes = activeZoneMinutes;
        result.activeZoneMinutes = activeZoneMinutes;
    }
    if (equals(distance, _lastActivities.distance)) {
        _lastActivities.distance = distance;
        result.distance = distance;
    }
    if (_elevationIsAvailable) {
        var elevationGain = new Activity(today.adjusted.elevationGain, goals.elevationGain);
        if (equals(elevationGain, _lastActivities.elevationGain)) {
            _lastActivities.elevationGain = elevationGain;
            result.elevationGain = elevationGain;
        }
    }
    // Return the result
    return result;
}
/**
 * Get Distances based on user units
 */
function getDistances() {
    // Metric
    if (units.distance === "metric") {
        return new Activity(today.adjusted.distance, goals.distance);
    }
    // Us
    // Then metric->miles
    return new Activity(metrics2Miles(today.adjusted.distance), metrics2Miles(goals.distance));
}
/**
 * Convert metric to milles
 * @param value to convert
 */
function metrics2Miles(value) {
    if (value === undefined)
        return undefined;
    return parseFloat((value * 0.00062137).toFixed(2));
}
/**
 * Test if a activities are equal
 * @param actual state of the activity
 * @param last state of the activity
 */
function equals(actual, last) {
    return last === undefined
        || actual.actual !== last.actual
        || actual.goal !== last.goal;
}
