import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    resetCommandOutputCache();
    jest.clearAllMocks();
  });

  it('should call getExecOutput only once for the same command and cwd', async () => {
    const spy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('node --version');

    expect(result1).toBe('v1.0.0');
    expect(result2).toBe('v1.0.0');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call getExecOutput multiple times for different commands', async () => {
    const spy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should call getExecOutput multiple times for different cwds', async () => {
    const spy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir2');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should recache after resetCommandOutputCache is called', async () => {
    const spy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version');
    resetCommandOutputCache();
    await getCommandOutput('node --version');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    const spy = jest
      .spyOn(exec, 'getExecOutput')
      .mockResolvedValueOnce({
        stdout: '',
        stderr: 'error',
        exitCode: 1
      })
      .mockResolvedValueOnce({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('fail')).rejects.toThrow('error');
    const result = await getCommandOutput('fail');

    expect(result).toBe('success');
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
