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

  it('should call getExecOutput only once for the same command', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'v22.22.1',
      stderr: '',
      exitCode: 0
    });

    const output1 = await getCommandOutput('node --version');
    const output2 = await getCommandOutput('node --version');

    expect(output1).toBe('v22.22.1');
    expect(output2).toBe('v22.22.1');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });

  it('should call getExecOutput again after cache reset', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'v22.22.1',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version');
    resetCommandOutputCache();
    await getCommandOutput('node --version');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should differentiate between different commands', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should differentiate between different working directories', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    getExecOutputSpy.mockResolvedValueOnce({
      stdout: '',
      stderr: 'error',
      exitCode: 1
    }).mockResolvedValueOnce({
      stdout: 'success',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('fail-then-succeed')).rejects.toThrow('error');
    const output = await getCommandOutput('fail-then-succeed');

    expect(output).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });
});
