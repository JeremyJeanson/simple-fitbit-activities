import { goals, today } from "user-activity";
import { me as appbit } from "appbit";
import { units } from "user-settings";
var Activities = (function () {
    function Activities() {
    }
    return Activities;
}());
export { Activities };
var Activity = (function () {
    function Activity(actual, goal) {
        this.actual = actual;
        this.goal = goal;
    }
    Activity.prototype.undefined = function () {
        return this.actual === undefined;
    };
    Activity.prototype.goalReached = function () {
        return !this.undefined() && this.actual >= this.goal;
    };
    Activity.prototype.as360Arc = function () {
        if (this.undefined() || this.goal === undefined
            || this.goal <= 0 || this.actual <= 0)
            return 0;
        if (this.actual >= this.goal)
            return 360;
        return this.actual * 360 / this.goal;
    };
    Activity.prototype.asPourcent = function () {
        if (this.undefined() || this.goal === undefined
            || this.goal <= 0 || this.actual <= 0)
            return 0;
        if (this.actual >= this.goal)
            return 100;
        return this.actual * 100 / this.goal;
    };
    return Activity;
}());
export { Activity };
var _lastActivities = new Activities();
var _callback;
var _elevationIsAvailable = appbit.permissions.granted("access_activity")
    && today.local.elevationGain !== undefined;
export function elevationIsAvailable() {
    return _elevationIsAvailable;
}
export function initialize(callback) {
    _callback = callback;
    _callback();
}
goals.addEventListener("reachgoal", function () {
    if (_callback === undefined)
        return;
    _callback();
});
export function reset() {
    _lastActivities.activeMinutes = undefined;
    _lastActivities.calories = undefined;
    _lastActivities.distance = undefined;
    _lastActivities.elevationGain = undefined;
    _lastActivities.steps = undefined;
}
export function getNewValues() {
    var result = new Activities();
    if (!appbit.permissions.granted("access_activity")) {
        var emptyActivity = new Activity(undefined, undefined);
        result.activeMinutes = emptyActivity;
        result.calories = emptyActivity;
        result.distance = emptyActivity;
        result.elevationGain = emptyActivity;
        result.steps = emptyActivity;
        return result;
    }
    var steps = new Activity(today.adjusted.steps, goals.steps);
    var calories = new Activity(today.adjusted.calories, goals.calories);
    var activeMinutes = new Activity(today.adjusted.activeMinutes, goals.activeMinutes);
    var distance = getDistances();
    if (equals(steps, _lastActivities.steps)) {
        _lastActivities.steps = steps;
        result.steps = steps;
    }
    if (equals(calories, _lastActivities.calories)) {
        _lastActivities.calories = calories;
        result.calories = calories;
    }
    if (equals(activeMinutes, _lastActivities.activeMinutes)) {
        _lastActivities.activeMinutes = activeMinutes;
        result.activeMinutes = activeMinutes;
    }
    if (equals(distance, _lastActivities.distance)) {
        _lastActivities.distance = distance;
        result.distance = distance;
    }
    if (_elevationIsAvailable) {
        var elevationGain = new Activity(today.local.elevationGain, goals.elevationGain);
        if (equals(elevationGain, _lastActivities.elevationGain)) {
            _lastActivities.elevationGain = elevationGain;
            result.elevationGain = elevationGain;
        }
    }
    return result;
}
function getDistances() {
    if (units.distance === "metric") {
        return new Activity(today.adjusted.distance, goals.distance);
    }
    return new Activity(metrics2Miles(today.adjusted.distance), metrics2Miles(goals.distance));
}
function metrics2Miles(value) {
    if (value === undefined)
        return undefined;
    return parseFloat((value * 0.00062137).toFixed(2));
}
function equals(actual, last) {
    return last === undefined
        || actual.actual !== last.actual
        || actual.goal !== last.goal;
}
