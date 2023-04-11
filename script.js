const fs = require('fs');
const path = require('path')
const { exec } = require('child_process');


// ANCHOR Getting GUI elements needed
// Actions
const cmd_execute = document.getElementById('cmd_execute')
// Configurations
const cfg_debug = document.getElementById('cfg_debug')
const cfg_continuous = document.getElementById('cfg_continuous')
const cfg_speak = document.getElementById('cfg_speak')
const cfg_save = document.getElementById('cfg_save')
// Utilities
const util_installDeps = document.getElementById('util_installDeps')
// Zones
const zone_personality = document.getElementById('zone_personality')
const zone_name = document.getElementById('zone_name')
const zone_output = document.getElementById('zone_output')

// Variables
var is_running = false

// NOTE Initial configuration
async function init() {
    // Setting up listeners
    cmd_execute.addEventListener('click', async () => {
        console.log("Execute button clicked")
        if (is_running) return // Avoid multiple executions
        // Executing autogpt on click on the Go button
        console.log('Executing')
        let args = await get_args_from_gui()
        console.log(args)
        is_running = true
        await execute_autogpt(args)
        is_running = false
    });
}

// NOTE Gives back the arguments from the GUI
async function get_args_from_gui() {
    // Configuration
    let _args = {
        name: zone_name.value,
        personality: zone_personality.value,
        goals: [],
        debug: cfg_debug.checked,
        continuous: cfg_continuous.checked,
        speak: cfg_speak.checked,
        save: cfg_save.checked
    }
    // Fetching goals
    for (let i = 1; i <= 5; i++) {
        let goal = document.getElementById(`zone_goal_${i}`).value
        _args.goals.push(goal)
    }
    return _args
}

async function execute_autogpt(args) {
    var child_autogpt;
    // TODO Run ../scripts/main.py and redirect all the output to a variable live in the GUI
}

(async () => {
    await init()
}) ();