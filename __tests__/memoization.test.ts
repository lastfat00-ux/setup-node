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

  it('should call exec.getExecOutput only once for the same command and cwd', async () => {
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

  it('should call exec.getExecOutput multiple times for different commands', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should call exec.getExecOutput multiple times for different cwds', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not cache errors', async () => {
    getExecOutputSpy.mockRejectedValueOnce(new Error('failure'));
    getExecOutputSpy.mockResolvedValue({
      stdout: 'success',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('command')).rejects.toThrow('failure');
    const result = await getCommandOutput('command');

    expect(result).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not cache non-zero exit codes', async () => {
    getExecOutputSpy.mockResolvedValueOnce({
      stdout: '',
      stderr: 'error',
      exitCode: 1
    });
    getExecOutputSpy.mockResolvedValue({
      stdout: 'success',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('command')).rejects.toThrow('error');
    const result = await getCommandOutput('command');

    expect(result).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });
});
