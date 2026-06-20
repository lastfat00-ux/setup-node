
import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
  let getExecOutputSpy: jest.SpyInstance;

  beforeEach(() => {
    resetCommandOutputCache();
    getExecOutputSpy = jest.spyOn(exec, 'getExecOutput');
  });

  afterEach(() => {
    getExecOutputSpy.mockRestore();
  });

  it('should memoize command output', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const out1 = await getCommandOutput('node --version');
    const out2 = await getCommandOutput('node --version');

    expect(out1).toBe('v1.2.3');
    expect(out2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });

  it('should include cwd in cache key', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    getExecOutputSpy
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('node --version')).rejects.toThrow('fail');
    const out = await getCommandOutput('node --version');

    expect(out).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle concurrent calls', async () => {
    let callCount = 0;
    getExecOutputSpy.mockImplementation(async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 10));
      return {
        stdout: 'concurrent',
        stderr: '',
        exitCode: 0
      };
    });

    const [out1, out2] = await Promise.all([
      getCommandOutput('node --version'),
      getCommandOutput('node --version')
    ]);

    expect(out1).toBe('concurrent');
    expect(out2).toBe('concurrent');
    expect(callCount).toBe(1);
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });
});
