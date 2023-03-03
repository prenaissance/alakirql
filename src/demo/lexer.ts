import fs from "fs/promises";
import lex from "../lexer";

const args = process.argv.slice(2);
const [file] = args;

if (!file) {
  console.error("No file specified");
  process.exit(1);
}

async function main() {
  const fileText = await fs.readFile(file, "utf-8");
  const tokens = lex(fileText);
  console.table(
    // @ts-ignore
    tokens.map(({ type, value, meta: { index } }) => ({ type, value, index })),
  );
}
main();
