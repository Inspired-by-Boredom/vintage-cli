'use strict';

const download = require('download');
const fsExtra  = require('fs-extra');
const fs       = require('fs');
const chalk    = require('chalk');
const path     = require('path');
const unzip    = require('unzip');

const utils = require('../modules/utils');
const cwd   = process.cwd();

const currentVintageFrontendVersion = utils.getVintageFrontendProjectVersion();
const backupFolderName = `${path.parse(cwd).name}-backup`;


let urls = {
  vintageCli: 'https://github.com/vintage-web-production/generator-vintage-frontend/archive/master.zip'
};
let commandOptions;

/**
 * Generate back-up or current files and update them (if newer version is available).
 *
 * @TODO: backups with uniq id
 */
module.exports = function (options) {
  const installedVintageCliVersion = require(`${process.env.cliRoot}/package.json`).version;

  commandOptions = Object.assign({}, options);

  utils.spinner.start();

  utils.say('Checking, if update is available for you...');

  download('https://raw.githubusercontent.com/vintage-web-production/vintage-cli/master/package.json')
    .then(data => {

      const latestVintageCliVersion = JSON.parse(data.toString()).version;

      if (installedVintageCliVersion < latestVintageCliVersion) {
        utils.say('Version of installed vintage-cli is not the latest!');
        utils.say(`Please, update vintage-cli first!: ${chalk.inverse.black('vintage update')}`);
        utils.say(`The latest version is: ${chalk.inverse.black.bold(latestVintageCliVersion)}`);
        utils.say(`Installed version is: ${chalk.inverse.black.bold(installedVintageCliVersion)}`, true);
        return false;
      }

      download('https://raw.githubusercontent.com/vintage-web-production/generator-vintage-frontend/master/package.json')
        .then(data => {

          const downloadedVersion = JSON.parse(data.toString()).version;

          if (currentVintageFrontendVersion === downloadedVersion && !commandOptions.force) {
            return utils.say('You have the latest version of vintage-frontend already!', true);
          }

          if (commandOptions.force) {
            utils.say('Force update!');
          } else {
            utils.say(`Ok, new version ${chalk.inverse.black.bold(downloadedVersion)} is available. Let's do it!`);
          }

          startUpdateProcess().then(finishUpdateProcess);
        })
        .catch(e => {
          utils.say(chalk.red('Something is gone wrong...'));
          utils.say('Files in your project have not been changed');
          console.error(e);
        });
    })
    .catch(e => {
      utils.say(chalk.red.bold('\n Error while fetching vintage-cli repository url \n'), true);

      throw new Error(e);
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

    fsExtra.copy(cwd, `${cwd}/${backupFolderName}`,
      {
        filter: source => {
          const notNodeModule = !source.includes('node_modules');
          const notBackupFolder = !source.includes(`${path.parse(cwd).name}-backup`);
          const notGit = !source.includes('.git');

          return notNodeModule && notBackupFolder && notGit;
        }
      },
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
 * Download vintage-frontend templates and extract them.
 *
 * @return {Promise}
 */
function downloadAndExtractFiles() {
  return new Promise(resolve => {
    try {
      fs.mkdirSync(`${cwd}/temp`)
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }

    download(urls.vintageCli, `${cwd}/temp`)
      .then(() => {
        fs.createReadStream(`${cwd}/temp/generator-vintage-frontend-master.zip`)
          .pipe(unzip.Extract({ path: `${cwd}/temp/` }))
          .on('close', resolve);
      });
  });
}

/**
 * Copy new template files (override).
 *
 * @return {Promise}
 */
function copyNewFiles() {
  return new Promise(resolve => {
    const rootPath = 'temp/generator-vintage-frontend-master/generators/app';
    const pathToTemplates = `${rootPath}/templates`;
    const pathToVCLITemplates = `${rootPath}/vintage-cli-templates`;

    // copy new files
    fsExtra

      // GULP tasks
      .copy(`${cwd}/${pathToTemplates}/gulp`, `${cwd}/gulp`)

      // webpack.config.js
      .then(() =>
        fsExtra.copy(`${cwd}/${pathToVCLITemplates}/webpack.config.js`, `${cwd}/webpack.config.js`)
      )

      // vintage-frontend.json
      .then(() =>
        fsExtra.copy(`${cwd}/${pathToTemplates}/vintage-frontend.json`, `${cwd}/vintage-frontend.json`)
      )

      // package.json new devDependencies, scripts and version
      .then(() => {
        const newPackage = fsExtra.readJsonSync(`${cwd}/${pathToVCLITemplates}/package.json`);
        const oldPackage = fsExtra.readJsonSync(`${cwd}/package.json`);

        oldPackage.version = newPackage.version;
        oldPackage.scripts = newPackage.scripts;
        oldPackage.devDependencies = Object.assign({}, oldPackage.devDependencies, newPackage.devDependencies);

        fsExtra.writeJsonSync(`${cwd}/package.json`, oldPackage);

        resolve();
      })
  });
}

/**
 * Delete temporary created files and directories.
 *
 * @return {Promise}
 */
function deleteTemporary() {
  return new Promise(resolve => {
    // delete TEMP folder
    fsExtra.removeSync(`${cwd}/temp`);

    resolve();
  });
}

/**
 * Start update process
 */
function startUpdateProcess() {
  return Promise.resolve()
    .then(makeBackup)
    .then(downloadAndExtractFiles)
    .then(() => {
      return new Promise(resolve => {
        utils.say('I\'ll wait for 3 seconds to be sure, that all new files on your disk already.');

        setTimeout(resolve, 3000);
      });
    })
    .then(copyNewFiles)
    .then(deleteTemporary)
    .catch(e => {
      console.log(chalk.red.bold(`\n Error while updating project: ${e}`));
      process.exit(0);
    })
}

/**
 * Finish update process
 */
function finishUpdateProcess() {
  utils.say('Project is updated! Happy coding.', true);
}