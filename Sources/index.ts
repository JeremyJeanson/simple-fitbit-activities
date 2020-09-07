// To know user activities
import { goals, today } from "user-activity";
import { me as appbit } from "appbit";
import { units } from "user-settings";

/***
 * All activities
 */
export class Activities {
    steps: Activity;
    elevationGain: Activity;
    calories: Activity;
    activeMinutes: Activity;
    distance: Activity;
}

/**
 * Activity helper
 */
export class Activity {
    // constructor
    constructor(actual: number, goal: number) {
        this.actual = actual;
        this.goal = goal;
    }

    /**
     * Current value of this activity
     */
    public readonly actual: number;

    /**
     * Value of the Goal to reach
     */
    public readonly goal: number;

    /**
     * Activity is undefined
     * (allways true when "access_activity" is not granted)
     */
    public undefined(): boolean {
        return this.actual === undefined;
    }

    /**
     * Return true if the goal of this activity was reached.
     */
    public goalReached(): boolean {
        return !this.undefined() && this.actual >= this.goal;
    }

    /**
     * Return this actual value as angle (0=0% and 360=100%)
     */
    public as360Arc(): number {
        // Check to avoid calcul
        if (this.undefined() || this.goal === undefined
            || this.goal <= 0 || this.actual <= 0) return 0;
        if (this.actual >= this.goal) return 360;
        // Calcul
        return this.actual * 360 / this.goal;
    }

    public asPourcent(): number {
        // Check to avoid calcul
        if (this.undefined() || this.goal === undefined
            || this.goal <= 0 || this.actual <= 0) return 0;
        if (this.actual >= this.goal) return 100;
        // Calcul
        return this.actual * 100 / this.goal;
    }
}

// Last values
const _lastActivities = new Activities();

// Call back to requestin interface update
let _callback: () => void;

// Detect limitations of versa light
const _elevationIsAvailable = appbit.permissions.granted("access_activity")
    && today.local.elevationGain !== undefined;

/**
 * Allow to detect elevation capacity on others device than versa light.
 */
export function elevationIsAvailable(): Boolean {
    return _elevationIsAvailable;
}

/**
 * Initialize this helper.
 * @param callback : method use to notify the application when activities changed
 */
export function initialize(callback: () => void): void {
    // Set call back
    _callback = callback;

    // use the Callback to init the app
    _callback();
}

// When goal is reached
goals.addEventListener("reachgoal", () => {
    if (_callback === undefined) return;
    _callback();
});

/**
 * Reset the last known state of activities.
 */
export function reset(): void {
    _lastActivities.activeMinutes = undefined;
    _lastActivities.calories = undefined;
    _lastActivities.distance = undefined;
    _lastActivities.elevationGain = undefined;
    _lastActivities.steps = undefined;
}

/**
 * Return activities if updates and updated values form previous states (if requested)
 * Properties are undefined if the values haven't changed since the last call
 */
export function getNewValues(): Activities {
    // Init
    const result = new Activities();

    // Check permission
    if (!appbit.permissions.granted("access_activity")) {
        // Return empty activities
        const emptyActivity = new Activity(undefined, undefined);
        result.activeMinutes = emptyActivity;
        result.calories = emptyActivity;
        result.distance = emptyActivity;
        result.elevationGain = emptyActivity;
        result.steps = emptyActivity;
        return result;
    }

    // Get current acticities
    const steps = new Activity(today.adjusted.steps, goals.steps);
    const calories = new Activity(today.adjusted.calories, goals.calories);
    const activeMinutes = new Activity(today.adjusted.activeMinutes, goals.activeMinutes);
    const distance = getDistances();

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
        const elevationGain = new Activity(today.local.elevationGain, goals.elevationGain);
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
function getDistances(): Activity {
    // Metric
    if (units.distance === "metric") {
        return new Activity(today.adjusted.distance, goals.distance);
    }
    // Us
    // Then metric->miles
    return new Activity(
        metrics2Miles(today.adjusted.distance),
        metrics2Miles(goals.distance));
}

/**
 * Convert metric to milles
 * @param value to convert
 */
function metrics2Miles(value: number): number {
    if (value === undefined) return undefined;
    return parseFloat((value * 0.00062137).toFixed(2));
}

/**
 * Test if a activities are equal
 * @param actual state of the activity
 * @param last state of the activity
 */
function equals(actual: Activity, last: Activity) {
    return last === undefined
        || actual.actual !== last.actual
        || actual.goal !== last.goal;
}