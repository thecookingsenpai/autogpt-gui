const fs = require('fs');
const path = require('path')
const { spawn } = require('child_process');
const { error } = require('console');
var child_autogpt = null
var first_input = false
let save_output = false


// ANCHOR Getting GUI elements needed
// Actions
const cmd_execute = document.getElementById('cmd_execute')
const cmd_stop = document.getElementById('cmd_stop')
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
const zone_error = document.getElementById('zone_error')

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
        zone_output.innerHTML = ''
        let args = await get_args_from_gui()
        console.log(args)
        is_running = true
        await execute_autogpt(args)
        is_running = false
    });

    cmd_stop.addEventListener('click', async () => {
        console.log("Stop button clicked")
        if (child_autogpt) {
            child_autogpt.kill()
            cmd_stop.classList.add('disabled')
            zone_output.scrollTop = zone_output.scrollHeight
        }
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
    if (!zone_error.classList.contains('hidden')) {
    zone_error.classList.add('hidden')
    }
    zone_error.innerHTML = ''
    // Sanity check
    if (args.goals[0] == '') {
        if (zone_error.classList.contains('hidden')) zone_error.classList.remove('hidden')
        zone_error.innerHTML = 'You need to specify at least one goal'
        return
    }
    if (args.personality == '') {
        if (zone_error.classList.contains('hidden')) zone_error.classList.remove('hidden')
        zone_error.innerHTML = 'You need to specify a personality'
        return
    }
    if (args.name == '') {
        args.name = 'Autogpt'
    }
    // TODO write the settings to ai_settings.yaml
    let settings = "ai_goals: \n"
    for (let i = 0; i < args.goals.length; i++) {
        settings += `- ${args.goals[i]}\n`
    }
    settings += "ai_name: " + args.name + "\n"
    settings += "ai_role: " + args.personality + "\n"
    fs.writeFileSync('../ai_settings.yaml', settings)
    // Define the arguments
    let additionals = []
    if (args.debug) {
        additionals.push('--debug')
    }
    if (args.continuous) {
        additionals.push('--continuous')
    }
    if (args.speak) {
        additionals.push('--speak')
    }
    if (args.save) {
        save_output = true
    }
    // REVIEW Run ../scripts/main.py and redirect all the output to a variable live in the GUI
    // Set up the command
    let cmd = 'python'
    let args_cmd = ['scripts/main.py']
    // Pushing the arguments
    args_cmd.push(...additionals)
    // Executing
    child_autogpt = spawn(cmd, args_cmd, {cwd: path.join(__dirname, '..')})
    if (child_autogpt.pid) {
        console.log('Child process started with PID ${child_autogpt.pid}')
        cmd_stop.classList.remove('hidden')
    }
    // INFO Setting up listeners
    child_autogpt.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        if (data.includes('Thinking...')) {
            if (zone_output.innerHTML.includes('Thinking...') ){
                data = "."
            }
        }
        // Go to the next line if the last character is thinking
        if (data.includes('Thinking...')) {
            zone_output.innerHTML += '<br>'
        }
        // Try to detect new lines
        if (data.includes('\n')) {
            zone_output.innerHTML += '<br>|>|> '
        }
        zone_output.innerHTML += data
        // Scroll to the bottom
        zone_output.scrollTop = zone_output.scrollHeight
        // NOTE if specified, save the output to a file
        if (save_output) {
            fs.appendFileSync(path.join(__dirname, 'output.txt'), data)
        }
        // NOTE If the first input is required, send a 'y' to the child process to read from ai_settings.yaml
        if (data.includes('(y/n)')) {
            if (!first_input) {
                first_input = true
                child_autogpt.stdin.write('y\n')
            }
        }
    });
    child_autogpt.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        zone_output.innerHTML += '<br><span class"red">' + data + '</span>'
    });
    child_autogpt.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        zone_output.innerHTML += '<br><p class"red">child process exited with code ' + code + '</p>'
        cmd_stop.classList.add('hidden')
    });
}

(async () => {
    await init()
}) ();