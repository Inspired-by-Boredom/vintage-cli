'use strict';

const chalk   = require('chalk');
const os      = require('os');
const fsExtra = require('fs-extra');
const Spinner = require('cli-spinner').Spinner;
const spawn   = require('win-spawn');

const spinner = new Spinner('%s');

/**
 * Check operation system name
 *
 * @return {Boolean} Is OS Windows or not
 */
function isWindows() {
  return (/^win/i).test(os.platform());
}

if (isWindows()) {
  spinner.setSpinnerString('|/-\\');
} else {
  spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏');
}

/**
 * Helper function for spinner, just stop and start spinner
 */
spinner.restart = function restart() {
  this.stop(true);
  this.start();
};

module.exports = {

  /**
   * Check that vintage-frontend project is generated in current directory.
   *
   * @return {Object}
   */
  isVintageFrontendInited() {
    const cwd = process.cwd();

    try {
      require(`${cwd}/vintage-frontend.json`);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        this.say(chalk.red('There are some problems with your vintage-frontend project!\n'), true);
        console.error(error.stack);
        return {
          inited: true,
          error: true
        };
      }

      return {
        inited: false,
        error: false
      };
    }

    return {
      inited: true,
      error: false
    };
  },

  /**
   * Get current vintage-frontend workflow version.
   *
   * @return {*}
   */
  getVintageFrontendProjectVersion() {
    const cwd = process.cwd();

    if (this.isVintageFrontendInited().inited) {
      return fsExtra.readJsonSync(`${cwd}/package.json`).version;
    }

    this.vintageFrontendNotInitedActions();
    return false;
  },

  /**
   * Run when vintage-frontend is not initialized
   *
   * @return {[type]} [description]
   */
  vintageFrontendNotInitedActions() {
    console.log('\n');
    this.say(chalk.red('vintage-frontend is not inited'));
    this.say(`Use ${chalk.inverse.black('"vintage-cli init"')} to create new vintage-frontend project \n`, true);
  },

  /**
   * Check vintage-cli initialization and gulp config in current directory
   *
   * @param {Boolean} [log]
   * @return {Boolean} vintage-frontend init status
   */
  isVintageFrontendReadyToWork(log = true) {
    const isVintageFrontendInited = this.isVintageFrontendInited();

    if (!isVintageFrontendInited.inited) {
      if (!isVintageFrontendInited.error && log) {
        this.vintageFrontendNotInitedActions();
      }
      return false;
    }

    return true;
  },

  /**
   * Run command in different env
   *
   * @param  {String} commandName     Name of the command
   * @param  {Array}  commandOptions  Options for task
   */
  runCommand(commandName, commandOptions) {
    spinner.stop(true);
    spawn(commandName, commandOptions, { stdio: 'inherit' });
  },

  /**
   * Output messages
   *
   * @param  {String}  message Message to output
   * @param  {Boolean} [stopSpinner] or restart it
   */
  say(message, stopSpinner) {

    // Restart spinner after every message from TARS
    stopSpinner ? this.spinner.stop(true) : this.spinner.restart();

    console.log(chalk.inverse.black('[Vintage]: ') + chalk.bold.white(message));
  },

  /**
   * Determines is current platform windows.
   *
   * @return {boolean}
   */
  isWindows,

  /**
   * Command line spinner
   */
  spinner
};