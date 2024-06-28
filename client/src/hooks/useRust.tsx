import { useEffect } from "react";
import __wbg_init from "../pkg/module/wasm-cairo";
import { compileRustCode } from "../utils/compileRustCode";
import { testStarknetContract } from "../utils/testStarknetContract";
import { testRustCode } from "../utils/testRustCode";

export const useRust = () => {
  useEffect(() => {
    __wbg_init();
  }, []);
  const compile = compileRustCode;
  const test = compileRustCode;
  const testContract = testStarknetContract;
  return {
    compile,
    test,
    testContract,
  };
};
