import init, { compileRustProgram, runRustProgram } from '../pkg_rusty/wasm_rust';

const url = new URL('../pkg_rusty/wasm_rust_bg.wasm', import.meta.url).href;

(async () => {
  await init(url); // Initialize the WASM module
})();

addEventListener('message', async (event) => {
  const { code, mode } = event.data;

  try {
    let result;
    if (mode === 'TEST') {
      result = await runRustProgram(code);
      console.log('TEST RESULT: ', result);
    } else {
      result = await compileRustProgram(code);
      console.log('COMPILE RESULT: ', result);
    }

    // Check the response format
    if (result && typeof result === 'object' && 'success' in result && 'message' in result) {
      if (!result.success || !code || code.trim() === '') {
        return postMessage({
          success: false,
          result: result.message,
          error: result.message,
        });
      }

      return postMessage({
        success: true,
        result: result.message,
      });
    } else {
      throw new Error('Invalid response format');
    }
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
