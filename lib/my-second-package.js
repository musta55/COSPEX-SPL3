'use strict';

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const shell = require('node-powershell');

let mySecondPackageView = null;
let subscriptions = null;

function activate(context) {
    mySecondPackageView = new MySecondPackageView(context);

    let disposable = vscode.commands.registerCommand('my-second-package.toggle', toggle);

    context.subscriptions.push(disposable);
}

function deactivate() {
    if (mySecondPackageView) {
        mySecondPackageView.destroy();
    }
    if (subscriptions) {
        subscriptions.dispose();
    }
}

function toggle() {
    // The package is toggled

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return;
    }

    const activePane = activeEditor.document.fileName;
    const completeCode = activeEditor.document.getText();

    const injectionCodePythonPath = path.join(__dirname, 'injectCodepython.py');
    const readPythonPath = path.join(__dirname, 'read_python.txt');
    const webpage = path.join(__dirname, 'cospex.html');
    const shellPath = path.join(__dirname, '..', 'node_modules', 'node-powershell');

    const injectCodePython = fs.readFileSync(injectionCodePythonPath, 'utf-8');

    step0();
    function step0(){
        // Injects users code into the injectCodepython.py and saves it as a new python file called python_output.py
        combiningCode(injectCodePython, step1);
    }
    function step1() {
        // executes the python_output.py
        runPowershell(step2);
    }
    function step2() {
        // Opens the webpage created in VS Code
        displayWebpage();
    }

    function combiningCode(injectCodePython, callback) {
        // Replaces the code
        injectCodePython = injectCodePython.replace(/<__b__s__>/gi, completeCode);
        // Replaces the name of the file
        injectCodePython = injectCodePython.replace(/<__f__n__>/gi, activePane);

        const fname = path.join(__dirname, 'python_output.py');
        fs.writeFileSync(fname, injectCodePython, 'utf-8');

        callback();
    }

    function runPowershell(callback) {
        const ps = new shell({
            executionPolicy: 'Bypass',
            noProfile: true
        });

        ps.addCommand(`cd ${__dirname}`);
        ps.invoke()
            .then(output => {
                const ps1 = new shell({
                    executionPolicy: 'Bypass',
                    noProfile: true
                });
                ps1.addCommand('py python_output.py');
                ps1.invoke()
                    .then(output => {
                        callback();
                    })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => {
                        ps1.dispose();
                    });
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                ps.dispose();
            });
    }

    function displayWebpage() {
        vscode.env.openExternal(vscode.Uri.file(webpage));
    }
}

class MySecondPackageView {
    constructor(context) {
        // Initialize your package view
    }

    destroy() {
        // Clean up any resources used by your package view
    }
}

module.exports = {
    activate,
    deactivate
};
