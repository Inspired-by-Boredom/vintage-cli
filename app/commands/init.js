const utils = require('../modules/utils');
const chalk = require('chalk');
const env   = require('yeoman-environment').createEnv();

/**
 * Run yeoman-generator.
 */
module.exports = function () {
  const isInited = utils.isVintageFrontendReadyToWork(false);

  // project was inited
  if (isInited) {
    console.log(chalk.red('The project has already been initialized'));

    // run yeoman generator
  } else {
    env.lookup(err => {
      if (err) {
        return console.log(chalk.red(`Error occurred while running generator: ${err}`));
      }

      env.run('vintage-frontend');
    });
  }
};