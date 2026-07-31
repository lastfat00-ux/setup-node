/* eslint-disable no-console */
import {getCommandOutput, resetCommandOutputCache} from './cache-utils';

async function runBenchmark() {
  console.log('=== Benchmarking getCommandOutput ===\n');

  // Measure first execution (uncached)
  const start1 = performance.now();
  const res1 = await getCommandOutput('node --version');
  const duration1 = performance.now() - start1;
  console.log(`Uncached run: ${res1} (took ${duration1.toFixed(2)}ms)`);

  // Measure second execution (cached)
  const start2 = performance.now();
  const res2 = await getCommandOutput('node --version');
  const duration2 = performance.now() - start2;
  console.log(`Cached run 1: ${res2} (took ${duration2.toFixed(2)}ms)`);

  // Measure third execution (cached)
  const start3 = performance.now();
  const res3 = await getCommandOutput('node --version');
  const duration3 = performance.now() - start3;
  console.log(`Cached run 2: ${res3} (took ${duration3.toFixed(2)}ms)`);

  // Run 10 sequential cached calls
  const start10 = performance.now();
  for (let i = 0; i < 10; i++) {
    await getCommandOutput('node --version');
  }
  const duration10 = performance.now() - start10;
  console.log(
    `10 sequential cached runs took total: ${duration10.toFixed(2)}ms`
  );

  // Verify reset cache
  resetCommandOutputCache();
  const start4 = performance.now();
  const res4 = await getCommandOutput('node --version');
  const duration4 = performance.now() - start4;
  console.log(
    `After reset (uncached again): ${res4} (took ${duration4.toFixed(2)}ms)`
  );

  console.log('\n======================================');
}

runBenchmark().catch(console.error);
