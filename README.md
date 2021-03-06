# vintage-cli

[![NPM version][npm-image]][npm-url]
![][license-url]

Command Line Interface for [vintage-frontend](https://github.com/Inspired-by-Boredom/generator-vintage-frontend) generator

## Install and update ##

`npm install -g vintage-cli`

or

`yarn add vintage-cli global`

> prepend with `sudo` if you are running on `*nix` OS.

## Usage ##

Run `vintage -v` or `vintage --version` to display current version of vintage-cli and vintage-frontend.

Also, you can run `vintage -h` or `vintage --help` to get information about available commands and flags.

## Commands ##

Execute command: `vintage <command> <flags>`

#### Available commands ####

`init` — run yeoman vintage-frontend generator to initialize new project.

`update` — update vintage-cli.

`update-project` — update gulp tasks, webpack config and package.json in current project (if updates are available).
Available flags:
*-f, --force* — force update, even you have the latest version

`run <taskName>` — start task (development or production)


## Version ##

Current version is 0.3.1

## Credits ##

[TARS-CLI](https://github.com/tars/tars-cli) was taken as the basis.

TARS-CLI author: [Artem Malko](https://github.com/artem-malko).

## License ##

[MIT License](https://github.com/Inspired-by-Boredom/vintage-cli/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/vintage-cli
[npm-image]: https://badge.fury.io/js/vintage-cli.svg
[license-url]: https://img.shields.io/npm/l/express.svg