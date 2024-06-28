import { ICompilationResult } from "../types/compilation";
import { Append } from "../types/exercise";
import { runRustCode } from "./runRustCode";

export const compileRustCode = (
  code: string,
  append?: Append
): ICompilationResult => {
  return runRustCode(code, "COMPILE", append);
};
