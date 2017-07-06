'use strict';

const chalk   = require('chalk');
const os      = require('os');
const fsExtra = require('fs-extra');
const Spinner = require('cli-spinner').Spinner;

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
   * Gets vintage-frontend config from current directory.
   *
   * @return {boolean | object} vintage-frontend config
   */
  getVintageFrontendConfig() {
    const cwd = process.cwd();
    const initedStatus = this.isVintageFrontendInited();

    if (initedStatus.inited && !initedStatus.error) {
      return require(`${cwd}/gulp/config`);
    }

    if (!initedStatus.error) {
      this.vintageFrontendNotInitedActions();
    }
    return false;
  },

  getVintageFrontendProjectVersion() {
    const cwd = process.cwd();

    if (this.isVintageFrontendInited().inited) {
      return fsExtra.readJsonSync(`${cwd}/package.json`).version;
    }

    this.vintageFrontendNotInitedActions();
    return false;
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

    console.log(chalk.inverse.black('[vintage]: ') + chalk.bold.white(message));
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
   * Validate folder name
   *
   * @param  {String} value received folder name
   * @return {Boolean || String} True or error text (not consistent, because of inquirer va)
   */
  validateFolderName(value) {
    const pass = /[?<>:*|"\\]/.test(value);

    if (!pass) {
      return true;
    }

    return 'Symbols \'?<>:*|"\\\' are not allowed. Please, enter a valid folder name!';
  },

  /**
   * Extract only used flags from inquirer options
   *
   * @param  {Object} inquirerOptions Inquirer options
   * @return {Array}
   */
  getUsedFlags(inquirerOptions) {
    return Object.keys(inquirerOptions).reduce((result, currentValue) => {
      if (currentValue.indexOf('_') !== 0 && currentValue !== 'options' &&
        currentValue !== 'commands' && currentValue !== 'parent') {
        result.push(currentValue);
      }

      return result;
    }, []);
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

  spinner,

  /**
   * Determines is current platform windows.
   *
   * @return {boolean}
   */
  isWindows
};