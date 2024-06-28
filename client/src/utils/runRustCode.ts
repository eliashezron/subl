import { compileRustProgram, runRustProgram } from "../pkg_rusty/wasm_rust";
import { ICompilationResult } from "../types/compilation";
import { Append } from "../types/exercise";
import { antiCheatAppend } from "./antiCheat";

export const runRustCode = (
  code: string,
  mode: "COMPILE" | "TEST",
  append?: Append
): ICompilationResult => {
  let result;
  const antiCheatCode = antiCheatAppend(code, append);

  if (mode === "TEST") {
    result = runRustProgram(antiCheatCode);
    console.log("TEST RESULT: ", result);
  } else {
    result = compileRustProgram(antiCheatCode);
    console.log("COMPILE RESULT: ", result);
  }

  if (
    result.startsWith("Compilation failed") ||
    result.includes("test result APPEND: FAILED") ||
    !code ||
    code.trim() === ""
  ) {
    return {
      success: false,
      result,
      error: result,
    };
  }
  return {
    success: true,
    result,
  };
};
