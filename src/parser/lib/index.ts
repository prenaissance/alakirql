import * as parserExports from "./parser";
import * as atomsExports from "./atoms";
import * as combinatorExports from "./combinations";

const P = {
  ...parserExports,
  ...atomsExports,
  ...combinatorExports,
};

export default P;
