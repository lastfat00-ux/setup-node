import * as cacheUtils from '../src/cache-utils';

async function benchmark() {
  const iterations = 5;
  const toolCommand = 'node --version';

  console.log(`Benchmarking '${toolCommand}' over ${iterations} iterations...`);

  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    const iterStart = Date.now();
    const output = await cacheUtils.getCommandOutput(toolCommand);
    const iterEnd = Date.now();
    console.log(`Iteration ${i + 1}: ${iterEnd - iterStart}ms (Output: ${output})`);
  }
  const end = Date.now();

  console.log(`Total time: ${end - start}ms`);
  console.log(`Average time: ${(end - start) / iterations}ms`);
}

benchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
