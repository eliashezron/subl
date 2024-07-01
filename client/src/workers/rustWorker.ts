import init, { compileRustProgram, runRustTests } from "../pkg_rusty/module/wasm_rust";
import { antiCheatAppend } from "../utils/antiCheat";

const url = new URL("../pkg_rusty/wasm_rust_bg.wasm", import.meta.url).href;

(async () => {
  await init(url); // Initialize the WASM module
})();

addEventListener('message', async (event) => {
  const { code, mode, append } = event.data;

  try {
    let result;
    const antiCheatCode = antiCheatAppend(code, append);

    if (mode === 'TEST') {
      result = await runRustTests(antiCheatCode);
    } else {
      result = await compileRustProgram(antiCheatCode);
    }

    if (typeof result === 'string' && (result.startsWith('Compilation failed') || !code || code.trim() === '')) {
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
    console.error('Error during Rust function execution:', error);

    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object' && error !== null && 'toString' in error) {
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
