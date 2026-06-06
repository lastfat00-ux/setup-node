import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
  let getExecOutputSpy: jest.SpyInstance;

  beforeEach(() => {
    resetCommandOutputCache();
    getExecOutputSpy = jest.spyOn(exec, 'getExecOutput');
  });

  afterEach(() => {
    getExecOutputSpy.mockRestore();
  });

  it('should call getExecOutput once for the same command and cache the result', async () => {
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

  it('should call getExecOutput twice for different commands', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should call getExecOutput twice for the same command with different cwd', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    getExecOutputSpy.mockResolvedValueOnce({
      stdout: '',
      stderr: 'error',
      exitCode: 1
    });

    await expect(getCommandOutput('fail')).rejects.toThrow('error');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);

    getExecOutputSpy.mockResolvedValueOnce({
      stdout: 'success',
      stderr: '',
      exitCode: 0
    });

    const result = await getCommandOutput('fail');
    expect(result).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should clear cache when resetCommandOutputCache is called', async () => {
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
});
