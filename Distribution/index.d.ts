/***
 * All activities
 */
export declare class Activities {
    steps: Activity;
    elevationGain: Activity;
    calories: Activity;
    activeZoneMinutes: ActiveZoneMinutesActivity;
    distance: Activity;
}
/**
 * Activity helper
 */
export declare class Activity {
    constructor(actual: number, goal: number);
    /**
     * Current value of this activity
     */
    readonly actual: number;
    /**
     * Value of the Goal to reach
     */
    readonly goal: number;
    /**
     * Activity is undefined
     * (allways true when "access_activity" is not granted)
     */
    undefined(): boolean;
    /**
     * Return true if the goal of this activity was reached.
     */
    goalReached(): boolean;
    /**
     * Return this actual value as angle (0=0% and 360=100%)
     */
    as360Arc(): number;
    /**
     * Return this actual progression as pourcentage
     */
    asPourcent(): number;
}
/**
 * ActiveZoneMinutes (properties "actual" and "goal" are defined with the total values)
 */
export declare class ActiveZoneMinutesActivity extends Activity {
    constructor();
    readonly cardio: Activity;
    readonly fatBurn: Activity;
    readonly peak: Activity;
}
/**
 * Allow to detect elevation capacity on others device than versa light.
 */
export declare function elevationIsAvailable(): Boolean;
/**
 * Initialize this helper.
 * @param callback : method use to notify the application when activities changed
 */
export declare function initialize(callback: () => void): void;
/**
 * Reset the last known state of activities.
 */
export declare function reset(): void;
/**
 * Return activities if updates and updated values form previous states (if requested)
 * Properties are undefined if the values haven't changed since the last call
 */
export declare function getNewValues(): Activities;
