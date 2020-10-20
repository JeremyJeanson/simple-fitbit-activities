
# Simple Fitbit Activities
[![npm](https://img.shields.io/npm/dw/simple-fitbit-activities.svg?logo=npm&label=npm%20version)](https://www.npmjs.com/package/simple-fitbit-activities)

## Introduction
The goal of this project is to simplify access and calculation of activities inside Fitbit OS applications.

It was built to do all this work easier and reduce the need to update the UI and calculations. Less you have to calculate something or update the UI and more you will reduce the impact of your application on the battery consumption.

## Features
This module includes many features to help developers :
- Get activities from a consistent way to allow you app to have a generic class to update the UI (each type of activity is reported as an object with the actual value, and goal,... and helpers).
- Report activities only when progression or goal changed (to avoid your app to make too many requests to the UI).
- Distance respect user preference (miles or metric).
- It contains many solutions to avoid exceptions in your applications.
- Method to obtain user progression as a percentage.
- Method to obtain user progression as angle (360°=100%).
- Type definitions for TypScript or JavaScript (with comments to visualize the documentation when you are coding).

## Data structure
Data returned by the module respect the `Activities` interface. Each property is defined when new values are available.
```ts
/***
 * All activities
 */
interface Activities {
    steps: Activity;
    elevationGain: Activity;
    calories: Activity;
    distance: Activity;
    activeZoneMinutes: ActiveZoneMinutesActivity;
}
```

Each property of `Activities` respect the `Activity` interface.
It exposes
- The current value of the activity (from the fitbit `today.adjusted` interface).
- The goal fixed by the user.
- Method to know if the current value was not defined (`true` when the user didn't allow access to activities).
- Method to know if the user as reached the goal of this activity (`false` if data are undefined or out of the range).
- Method to obtain user progression as a percentage (`0` if data are undefined or calculation is impossible).
- Method to obtain user progression as angle (360°=100%). (`0` if data are undefined or calculation is impossible).

```ts
/**
 * Activity
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
     * Return the actual progression as angle (0=0% and 360=100%)
     */
    as360Arc(): number;
    /**
     * Return the actual progression as pourcentage
     */
    asPourcent(): number;
}
```

ActiveZoneMinutesActivity as 3 more properties:
- cardio of type Activity.
- fatBurn of type Activity.
- peak of type Activity.

Properties `actual` and `goal` are exposing total values.

## Installation

### 1. Install the module

You could use a any package manager to install this module. it was tested with npm and pnpm.

```sh
npm install simple-fitbit-activities --save-dev
```

### 2. Request user's permissions

Your application should have access to :
- `access_activity` : requested to obtain activities of the user.
- `access_user_profile`: requested to know if the user use miles or meters for distance.

Your `package.json` should be like this (you could request more permissions, it is not a problem) : 

Exemple :
```json
{
    "requestedPermissions": [
        "access_activity",
        "access_user_profile"]
}
```
If permissions are not well set, you will not have exceptions :
- Activitiy's method `undefined()` could return false.
- Values and calculs will return `0`.
- Distance will use `miles` as unit.

### 3. Initialize the device app

Inside the `app` folder the `index.ts` file have to :
- Import the module.
- Initialize the module with the method to call when UI should be updated with new activities.

Exemple :
```ts
import * as simpleActivities from "simple-fitbit-activities";
// initialize
simpleActivities.initialize(UpdateActivities);
```

### 4. Use and get activities

The `UpdateActivities` have to call the `getNewValues()` method to obtain new values.

Exemple :
```ts
// Update Activities informations
function UpdateActivities() {
  // Get activities
  const activities = simpleActivities.getNewValues();
  // Steps
  UpdateActivity(_stepsContainer, activities.steps);
  // Calories
  UpdateActivity(_calsContainer, activities.calories);
  // Active minutes
  UpdateActivity(_amContainer, activities.activeMinutes);
  // Disance
  UpdateActivity(_distContainer, activities.distance);
}
```

The method `UpdateActivity` ia a generic method (for example). This method is here to update the UI. Prior to update the UI, the `Activity` should be verified. It will be `undefined` if values haven't changed since the last call.

### 5. Refresh / update

This module hasn't logic to periodic refresh. You have to call your `UpdateActivities` 
method when you need an update of user activities (you could use the Fitbit `clock` module to).

### 6. Bonus

The method `elevationIsAvailable()` allow your app to check if the device has capacity to monitor user elevation.
The module has a reset method. It will delete cache of activities. Next call to `getNewValues()` will return an object will all properties defined. It could have an interest when you have to reset your UI, or when you want to force the call of all your methods.

Exemple:
```ts
// Reset activities
simpleActivities.reset();
// Call an update
UpdateActivities();
```
## Contribute or report issues

You can report any issue via GitHub, if you found one, please report it!
This code was open to be shared and improved. If you have an idea, tell it or send a pull request.
Keep in mind that this module is built for small devices. It does not have the goal to be a Swiss knife with hundreds of functions. It is why it is simple as possible.

## Compilation

This module was built with TypeScript. It uses Typescript to generate JavaScript files that are imported by the Fitbit SDK.
It includes the following npm scripts to:
- build (generate JavaScript files and copy all requested files to the `./distribution` directory)
- clean (remove generated files from the `./distribution` directory).

If you change exported methods or class, think to update those files.