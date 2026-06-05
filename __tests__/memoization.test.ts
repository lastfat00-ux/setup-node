import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
  let getExecOutputSpy: jest.SpyInstance;

  beforeEach(() => {
    getExecOutputSpy = jest.spyOn(exec, 'getExecOutput');
    resetCommandOutputCache();
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

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('node --version');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });

  it('should use different cache for different commands', async () => {
    getExecOutputSpy.mockImplementation(async (command: string) => {
      if (command === 'node --version') {
        return {stdout: 'v1.2.3', stderr: '', exitCode: 0};
      }
      return {stdout: '8.0.0', stderr: '', exitCode: 0};
    });

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('npm --version');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('8.0.0');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should use different cache for different working directories', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
    expect(getExecOutputSpy).toHaveBeenNthCalledWith(
      1,
      'node --version',
      undefined,
      expect.objectContaining({cwd: 'dir1'})
    );
    expect(getExecOutputSpy).toHaveBeenNthCalledWith(
      2,
      'node --version',
      undefined,
      expect.objectContaining({cwd: 'dir2'})
    );
  });

  it('should reset cache', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version');
    resetCommandOutputCache();
    await getCommandOutput('node --version');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not cache errors', async () => {
    getExecOutputSpy
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('node --version')).rejects.toThrow('failed');

    // Should try again because first one failed and was removed from cache
    const result = await getCommandOutput('node --version');
    expect(result).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });
});
