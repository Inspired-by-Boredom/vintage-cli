'use strict';

const chalk     = require('chalk');
const utils     = require('../modules/utils');
const download  = require('download');

/**
 * Get vintage-cli version
 */
module.exports = function getVersion() {
  console.log('\n');
  const vintageCliVersion = require(`${process.env.cliRoot}/package.json`).version;
  utils.say(`vintage-cli version: "${chalk.inverse.black(vintageCliVersion)}"`, true);

  Promise
    .resolve()
    .then(() => new Promise((resolve, reject) => {

      download('https://raw.githubusercontent.com/vintage-web-production/vintage-cli/master/package.json')
        .then(data => {
          const latestVintageCliVersion = JSON.parse(data.toString()).version;

          if (vintageCliVersion < latestVintageCliVersion) {
            utils.say(
              `Update available for vintage-cli. New version is: "${chalk.inverse.black(latestVintageCliVersion)}"`,
              true
            );
            utils.say(
              `Run the command "${chalk.inverse.black('vintage update')}" to update vintage-cli. \n`,
              true
            );
          }
          return resolve();
        })
        .catch(e => {
          reject(console.log(chalk.red.bold(`\n Error while fetching vintage-cli repository url: ${e} \n`)));
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

      download('https://raw.githubusercontent.com/Vintage-web-production/generator-vintage-frontend/master/package.json')
        .then(data => {
          if (!installedVintageFrontendVersion) {
            console.log(chalk.red.bold('No installed vintage front-end found'))
          }

          const latestVintageFrontendVersion = JSON.parse(data.toString()).version;

          if (installedVintageFrontendVersion < latestVintageFrontendVersion) {
            utils.say(
              `Update available for vintage-frontend. New version is: "${chalk.inverse.black(latestVintageFrontendVersion)}"`,
              true
            );
            utils.say(
              `Run the command "${chalk.inverse.black('vintage update-project')}" to update vintage-frontend in current project. \n`,
              true
            );
          }
        })
        .catch(e => {
          console.log(chalk.red.bold(`\n Error while fetching generator-vintage-frontend repository url: ${e} \n`));
        });
    })
    .catch(error => {
      console.log(error);
    });
};