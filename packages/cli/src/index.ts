#! /usr/bin/env node
import fs from "node:fs/promises";
import repl from "node:repl";
import { Argument, Command } from "commander";
import figlet from "figlet";
import gradient from "gradient-string";
// ? For some reason it fails on the pipeline only, find the reason later
// eslint-disable-next-line import/no-unresolved
import { lex, parse, Interpreter, interpret } from "@alakir/core";

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
  .action(async (source: string | undefined, options: Options) => {
    const { file } = options;
    if (!source && !file) {
      const interpreter = new Interpreter();
      repl.start({
        prompt: gradient.passion("alakir> "),
        eval: (cmd, context, filename, callback) => {
          const unsubscribe = interpreter.io.subscribe((message: any) => {
            callback(null, message);
          });
          try {
            interpreter.interpret(cmd);
          } catch (e) {
            callback(e as Error, "");
          } finally {
            unsubscribe();
          }
        },
      });
      return;
    }
    const input = await getInput(source, { file });
    interpret(input);
  });

program
  .command("lex")
  .addArgument(sourceArgument)
  .action(async (source) => {
    const { file, output } = program.opts<Options>();
    if (!source && !file) {
      repl.start({
        prompt: gradient.passion("alakir> "),
        eval: (cmd, context, filename, callback) => {
          try {
            const result = lex(cmd);
            callback(null, result);
          } catch (e) {
            callback(e as Error, "");
          }
        },
      });
      return;
    }
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
    if (!source && !file) {
      repl.start({
        prompt: gradient.passion("alakir> "),
        eval: (cmd, context, filename, callback) => {
          const result = parse(cmd);
          if (result.isError) {
            callback(null, chalk.red(result.error));
          } else {
            callback(null, JSON.stringify(result.result, null, 2));
          }
        },
      });
      return;
    }
    const input = await getInput(source, { file });
    const result = parse(input);
    const outputString = result.isError
      ? chalk.red(result.error)
      : JSON.stringify(result.result, null, 2);
    await outputStrategy(outputString, { output });
  });

await program.parseAsync(process.argv);
