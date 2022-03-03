import arg from 'arg';
import inquirer from 'inquirer';
import {createProject} from '../src/main'

function getNameApp(){
    let dirString = process.cwd();
    var inputArray = dirString.split("/")
    let nameString = inputArray[inputArray.length-1]
    return nameString;
}

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg({
        '--git': Boolean,
        '--yes': Boolean,
        '--install': Boolean,
        '-g': '--git',
        '-y': '--yes',
        '-i': '--install',
        '-nm': '--nameapp',
    },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0],
        nameApp: args['--nameapp'] || args['--nm'],
        runInstall: args['--install'] || false,
    };
}

async function promptForMissingOptions(options) {
    const defaultTemplate = 'react-app';
    if (options.skipPrompts) {
        return {
            ...options,
            template: options.template || defaultTemplate,
        };
    }

    const questions = [];
    if(!options.nameApp) {
        questions.push({
            type: 'text',
            name: 'nameApp',
            message: 'Do you change name application?',
            default: getNameApp(),
        });
    }

    if (!options.template) {
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Please choose which project template to use',
            choices: ['react-app', 'angular', 'spring-boot'],
            default: defaultTemplate,
        });
    }

    if (!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize a git repository?',
            default: false,
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        template: options.template || answers.template,
        nameApp: answers.nameApp,
        git: options.git || answers.git
    };
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await createProject(options)
}