'use strict';

const Download = require('download');
const fsExtra  = require('fs-extra');
const del      = require('del');
const fs       = require('fs');
const chalk    = require('chalk');
const path     = require('path');

const utils = require('../modules/utils');
const cwd   = process.cwd();

const currentVintageFrontendVersion = utils.getVintageFrontendProjectVersion();
const backupFolderName = `${path.parse(cwd).name}-backup-${new Date()}`;

let urls = {
  gulp: '',
  webpackConfig: '',
  package: ''
};
let commandOptions;

/**
 * Generate back-up or current files and update them (if newer version is available).
 */
module.export = function (options) {
  const installedVintageCliVersion = require(`${process.env.cliRoot}/package.json`).version;

  commandOptions = { ...options };

  utils.spinner.start();

  utils.say('Checking, if update is available for you...');

  new Download({ extract: true, mode: '755' })
    .get('https://raw.githubusercontent.com/vintage-web-production/vintage-cli/master/package.json')
    .run((error, files) => {

      if (error) {
        utils.say(chalk.red.bold('\n Error while fetching vintage-cli repository url \n'), true);

        throw new Error(error);
      }

      const latestVintageCliVersion = JSON.parse(files[0].contents.toString()).version;

      if (installedVintageCliVersion < latestVintageCliVersion) {
        utils.say('Version of installed vintage-cli is not the latest!');
        utils.say(`Please, update vintage-cli first!: "npm i -g vintage-cli"`);
        utils.say(`The latest version is: ${chalk.inverse.black.bold(latestVintageCliVersion)}`);
        utils.say(`Installed version is: ${chalk.inverse.black.bold(installedVintageCliVersion)}`, true);
        return false;
      }

      new Download({ extract: true, mode: '755' })
        .get('https://raw.githubusercontent.com/vintage-web-production/generator-vintage-frontend/master/package.json')
        .run((error, files) => {

          if (error) {
            utils.say(chalk.red('Something is gone wrong...'));
            utils.say('Files in your project have not been changed');
            console.error(error);
          }

          const downloadedVersion = JSON.parse(files[0].contents.toString()).version;

          if (currentVintageFrontendVersion === downloadedVersion && !commandOptions.force) {
            return utils.say('You have the latest version of vintage-frontend already!', true);
          }

          if (commandOptions.force) {
            utils.say('Force update!');
          } else {
            utils.say(`Ok, new version ${chalk.inverse.black.bold(downloadedVersion)} is available. Let's do it!`);
          }

          startUpdateProcess();
        });
    });
};

/**
 * Makes backup of current files.
 *
 * @return {Promise}
 */
function makeBackup() {
  return new Promise(resolve => {

    utils.say('Please, wait for a minute, while I\'m creating backup of your current project...');

    fsExtra.copy(cwd, `${cwd}/${backupFolderName}`, {},
      error => {
        if (error) {
          throw new Error(error);
        }

        utils.say(
          `Backup has been created. Folder name is: "${chalk.inverse.black(backupFolderName)}"`
        );
        resolve();
      }
    );
  });
}

/**
 * Just start update process
 */
function startUpdateProcess() {
  Promise
    .resolve()
    .then(() => {
      return new Promise(resolve => {
        utils.say('New version has been downloaded successfully.');
        utils.say('I\'ll wait for 5 seconds to be sure, that all new files on your disk already.');

        setTimeout(() => {
          resolve();
        }, 5000);
      });
    })
    .then(makeBackup);
}