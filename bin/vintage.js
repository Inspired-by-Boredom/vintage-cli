#!/usr/bin/env node

'use strict';

/**
 * Vintage command-line interface for vintage-frontend workflow.
 *
 * @author Vitali Shapovalov
 * @version 0.3.1
 *
 * vintage -v / --version    get current vintage-cli / vintage-frontend workflow in current project
 * vintage -h / --help       list available commands
 *
 * vintage init              run yeoman vintage-frontend generator
 * vintage update            update vintage-cli
 * vintage update-project    check for available updates and update project in current repository
 * vintage run <taskName>    start task (development or production)
 *
 * @TODO: Tests coverage
 * @TODO: vintage-frontend VERSION
 * @TODO: merge vintage-cli-templates
 * @TODO: prettier support
 */

const program     = require('commander');
const fs          = require('fs');
const path        = require('path');
const utils       = require('../app/modules/utils');
const args        = process.argv.slice(2);
const cliRootPath = path.resolve(__dirname, '../');
let npmRootPath   = path.join(cliRootPath, 'node_modules/');

try {
  fs.statSync(npmRootPath);
} catch (error) {
  npmRootPath = path.resolve(cliRootPath, '../') + path.sep;
}

// Get root npm directory for global packages and create env-var with it.
process.env.cliRoot = cliRootPath;
process.env.npmRoot = npmRootPath;

program
  .usage('[command] [options]');

program
  .command('init')
  .description('Run vintage-frontend generator ("yo" and "generator-vintage-frontend" must be installed globally)')
  .action(() => require('./../app/commands/init')());

program
  .command('update')
  .description('Update vintage-cli')
  .action(() => require('../app/commands/update')());

program
  .command('update-project')
  .description('Update vintage-frontend in current project')
  .option('-f, --force', 'Force update, even you have the latest version')
  .action(options => {
    if (utils.isVintageFrontendReadyToWork()) require('./../app/commands/update-project')(options);
  });

program
  .command('run <taskName>')
  .description('Start task (development or production)')
  .action(options => {
    if (utils.isVintageFrontendReadyToWork()) require('../app/commands/tasks')(options);
  });

program
  .option('-v, --version', 'Version of vintage-cli and vintage-frontend');

if (program.version && args.length && (args[0] === '--version' || args[0] === '-v')) {
  require('./../app/commands/version')();
}

if (!args.length) {
  program.outputHelp();
}

program.parse(process.argv);