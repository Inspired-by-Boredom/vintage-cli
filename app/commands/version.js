'use strict';

const chalk     = require('chalk');
const utils     = require('../modules/utils');
const Download  = require('download');

/**
 * Get vintage-cli version
 */
module.exports = function getVersion() {
  console.log('\n');
  const vintageCliVersion = require(`${process.env.cliRoot}/package.json`).version;
  utils.say(`vintage-cli version: "${chalk.inverse.black(vintageCliVersion)}"`, true);

  Promise
    .resolve()
    .then(() => new Promise(resolve => {
      new Download({ extract: true, mode: '755' })
        .get('https://raw.githubusercontent.com/vintage-web-production/vintage-cli/master/package.json')
        .run((error, files) => {
          if (error) {
            return resolve(console.log(chalk.red.bold('\n Error while fetching vintage-cli repository url \n')));
          }

          const latestVintageCliVersion = JSON.parse(files[0].contents.toString()).version;

          if (vintageCliVersion < latestVintageCliVersion) {
            utils.say(
              `Update available for vintage-cli. New version is: "${chalk.inverse.black(latestVintageCliVersion)}"`,
              true
            );
            utils.say(
              `Run the command "${chalk.inverse.black('vintage-cli update')}" to update vintage-cli. \n`,
              true
            );
          }
          return resolve();
        });
    }))
    .then(() => {
      let installedVintageFrontendVersion;

      try {
        installedVintageFrontendVersion = require(`${process.cwd()}/package.json`).version;
        utils.say(`vintage-frontend version in current project: "${chalk.inverse.black(installedVintageFrontendVersion)}"`, true);
      } catch (error) {
        installedVintageFrontendVersion = undefined;
      }

      new Download({ extract: true, mode: '755' })
        .get('https://raw.githubusercontent.com/Vintage-web-production/generator-vintage-frontend/master/package.json')
        .run((error, files) => {
          if (error || !installedVintageFrontendVersion) {
            console.log(chalk.red.bold('\n Error while fetching generator-vintage-frontend repository url \n'))
          }

          const latestVintageFrontendVersion = JSON.parse(files[0].contents.toString()).version;

          if (installedVintageFrontendVersion < latestVintageFrontendVersion) {
            utils.say(
              `Update available for vintage-frontend. New version is: "${chalk.inverse.black(latestVintageFrontendVersion)}"`,
              true
            );
            utils.say(
              `Run the command "${chalk.inverse.black('vintage-cli update-project')}" to update vintage-frontend in current project. \n`,
              true
            );
          }
        });
    })
    .catch(error => {
      console.log(error);
    });
};