import runTests from "../pkg_rusty/wasm_rust";
import { compileRustProgram } from "../pkg_rusty/wasm_rust";
import __wbg_init from "../pkg_rusty/wasm_rust";

const url = new URL("../pkg_rusty/wasm_rust_bg.wasm", import.meta.url).href;

(async () => {
  await __wbg_init(url);
})();

addEventListener("message", async (event) => {
  const { code, mode } = event.data;

  try {
    let result;
    if (mode === "TEST") {
      result = await runTests(code);
      console.log("TEST RESULT: ", result);
    } else {
      result = await compileRustProgram(code);
      console.log("COMPILE RESULT: ", result);
    }

    if ((result as string).startsWith("Compilation failed") || !code || code.trim() === "") {
      return postMessage({
        success: false,
        result,
        error: result,
      });
    }

    return postMessage({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error during Rust function execution:", error);
    
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (typeof error === "object" && error !== null && "toString" in error) {
      errorMessage = error.toString();
    }

    return postMessage({
      success: false,
      result: errorMessage,
      error: errorMessage,
    });
  }
});

export {};