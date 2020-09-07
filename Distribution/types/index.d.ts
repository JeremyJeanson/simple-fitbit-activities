declare module "simple-fitbit-activities" {

    /***
     * All activities
     */
    interface Activities {
        steps: Activity;
        elevationGain: Activity;
        calories: Activity;
        activeMinutes: Activity;
        distance: Activity;
    }

    /**
     * Activity helper
     */
    interface Activity {
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

        asPourcent(): number;
    }

    /**
     * Allow to detect elevation capacity on others device than versa light.
     */
    function elevationIsAvailable(): Boolean;

    /**
     * Initialize this helper.
     * @param callback : method use to notify the application when activities changed
     */
    function initialize(callback: () => void): void;

    /**
     * Reset the last known state of activities.
     */
    function reset(): void;

    /**
     * Return activities if updates and updated values form previous states (if requested)
     * Properties are undefined if the values haven't changed since the last call
     */
    function getNewValues(): Activities;
}