#!/bin/env node
import { version } from "../package.json";
import { program } from "commander";

program
  .version(version)
  .name("alakirql")
  .description("AlakirQL is a DSL for astrology");

program.parse(process.argv);
