#!/usr/bin/env node

const chalk = require("chalk");
const log = console.log;
const figlet = require("figlet");
const inquirer = require("inquirer");
const { program } = require("commander");
const screenshot = require("../utils/screenshot");
const STATUS = require("ora")();
const puppeteer = require("puppeteer");
// const device_names = puppeteer.devices.map(v => v.name);

const args = process.argv.slice(2);
args.length === 0 &&
  log(
    chalk.yellow(figlet.textSync("Screenshot", { horizontalLayout: "full" }))
  );

program
  .usage("<command> [options]")
  .version("0.0.1", "-v, --vers", "output the current version")
  .arguments("<cmd> [env]")
  .option("-u, --url <url>", "which web url to screenshot")
  .option("-d, --device <device>", "which device to screenshot. pc | mobile")
  .option(
    "-t, --fileType <fileType>",
    "file type to save such like image | pdf"
  )
  .option(
    "-n, --fileName <fileName>",
    "file name to save such like filenameAbc"
  );

program
  .command("start")
  .description("generates a screenshot of the page")
  .action((source, destination) => {
    const { url, device, fileType, fileExt, fileName } = program.opts();
    const urlValidRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    if (url && !url.match(urlValidRegex)) {
      return STATUS.fail(chalk.bold.red("url is invalid!"));
    }
    if (device && !["pc", "mobile"].includes(device)) {
      return STATUS.fail(chalk.bold.red("device is invalid!"));
    }
    if (fileType && !["image", "pdf"].includes(fileType)) {
      return STATUS.fail(chalk.bold.red("fileType is invalid!"));
    }
    if (fileName && !fileName.trim()) {
      return STATUS.fail(chalk.bold.red("fileName is invalid!"));
    }
    const questions = [
      {
        type: "input",
        name: "url",
        message: "Input web url to screenshot",
        validate: function(text) {
          return text.match(urlValidRegex)
            ? true
            : log(chalk.red(" <= Url is invalid!"));
        },
        when: !url
      },
      {
        type: "list",
        choices: ["pc", "mobile"],
        name: "device",
        message: "which device to screenshot",
        when: !device
      },
      {
        type: "list",
        choices: ["image", "pdf"],
        name: "fileType",
        message: "Which fileType to save",
        when: !fileExt
      },
      {
        type: "list",
        choices: ["jpeg", "png"],
        name: "fileExt",
        message: "Which .ext to save",
        when: function(answers) {
          return answers.fileType === "image";
        }
      },
      {
        type: "input",
        name: "fileName",
        message: "Input you filename",
        default: "screenshot",
        when: !fileName
      }
    ];

    inquirer
      .prompt(questions)
      .then(async answers => {
        STATUS.start(`Loading`);
        const _url = answers.url || url;
        const _device = answers.device || device;
        const _fileType = answers.fileType || fileType;
        const _fileExt = answers.fileExt || fileExt;
        const _fileName = answers.fileName || fileName;
        const filePath = `${process.cwd()}/${_fileName}.${
          _fileType === "pdf" ? "pdf" : _fileExt
        }`;

        await screenshot({
          url: _url,
          type: _fileType,
          device: _device,
          path: filePath
        });
        STATUS.succeed(
          `Please go ${chalk.magenta.bold.underline(`${filePath}`)} to check!`
        );
      })
      .catch(error => {
        STATUS.fail(chalk.red(`Something wrong! ${error}`));
        if (error.isTtyError) {
          // Prompt couldn't be rendered in the current environment
        } else {
          // Something else when wrong
        }
      })
      .finally(() => {
        process.exit();
      });
  });

program.parse(process.argv);
