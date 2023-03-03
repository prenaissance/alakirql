import fs from "node:fs/promises";
import parse from "../parser";
import { match } from "@/parser/lib/parser";

const args = process.argv.slice(2);
const [file] = args;

if (!file) {
  console.error("No file specified");
  process.exit(1);
}

async function main() {
  const fileText = await fs.readFile(file, "utf-8");
  const result = parse(fileText);
  match(
    (ast) => {
      console.log(JSON.stringify(ast.result, null, 2));
    },
    (error) => {
      console.error(error.error);
      process.exit(1);
    },
  )(result);
}
main();
