#! /usr/bin/env node
import fs from "node:fs/promises";
import { Argument, Command } from "commander";
import figlet from "figlet";
import gradient from "gradient-string";
// ? For some reason it fails on the pipeline only, find the reason later
// eslint-disable-next-line @import/no-unresolved
import { lex, parse } from "@alakir/core";

import { version } from "../package.json";
import chalk from "chalk";

type Options = {
  file?: string;
  output?: string;
};

const program = new Command();

const sourceArgument = new Argument("[source]", "inline alakir code");

const getInput = (source: string | undefined, options: Options) => {
  if (!options.file) {
    if (!source) {
      console.error("No source argument or file provided.");
      process.exit(1);
    }
    return Promise.resolve(source);
  }
  return fs.readFile(options.file, "utf-8");
};

const outputStrategy = (result: string, options: Options) => {
  if (!options.output) {
    return Promise.resolve(console.log(result));
  }
  return fs.writeFile(options.output, result);
};

program
  .version(version, "-v")
  .name("alakir")
  .description(
    gradient.passion(
      figlet.textSync("AlakirQL", {
        font: "ANSI Shadow",
      }),
    ),
  )
  .addArgument(sourceArgument)
  .option("-f, --file <file>", "input file")
  .option("-o, --output <file>", "output file")
  .action((source: string | undefined, options: Options) => {
    const { file } = options;
    if (!source && !file) {
      console.log("repl not implemented yet");
      return;
    }

    console.log("interpreter not implemented yet");
  });

program
  .command("lex")
  .addArgument(sourceArgument)
  .action(async (source) => {
    const { file, output } = program.opts<Options>();
    const input = await getInput(source, { file });
    try {
      const result = lex(input);
      await outputStrategy(JSON.stringify(result, null, 2), { output });
    } catch (e) {
      console.error(chalk.red((e as Error).message));
    }
  });

program
  .command("parse")
  .addArgument(sourceArgument)
  .action(async (source) => {
    const { file, output } = program.opts<Options>();
    const input = await getInput(source, { file });
    const result = parse(input);
    const outputString = result.isError
      ? chalk.red(result.error)
      : JSON.stringify(result.result, null, 2);
    await outputStrategy(outputString, { output });
  });

await program.parseAsync(process.argv);
