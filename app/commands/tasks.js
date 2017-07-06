'use strict';

const chalk = require('chalk');
const utils = require('../modules/utils');

/**
 * Run production / development scripts.
 *
 * @param {String} taskName
 */
module.exports = function (taskName) {
  console.log('\n');
  utils.spinner.start();
  utils.say(chalk.underline(`${taskName} task has been started!`) + '\n');

  utils.runCommand('npm', ['run', taskName]);
};
