'use strict';

const chalk = require('chalk');
const execSync = require('child_process').execSync;
const utils = require('../modules/utils');

/**
 * Update vintage-cli and dependencies (vintage-frontend generator)
 */
module.exports = function () {
  utils.spinner.start();
  utils.say(chalk.underline('vintage-cli update has been started!'));

  execSync('npm cache clean');
  utils.runCommand('npm', ['update', '-g', 'vintage-cli', 'generator-vintage-frontend']);
};