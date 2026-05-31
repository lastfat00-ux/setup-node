import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetCommandOutputCache();
  });

  it('should memoize command output', async () => {
    const getExecOutputSpy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
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

  it('should not memoize if command fails', async () => {
    const getExecOutputSpy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: '',
      stderr: 'error',
      exitCode: 1
    });

    await expect(getCommandOutput('fail')).rejects.toThrow('error');
    await expect(getCommandOutput('fail')).rejects.toThrow('error');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should memoize different commands separately', async () => {
    const getExecOutputSpy = jest.spyOn(exec, 'getExecOutput').mockImplementation((commandLine: string) => {
      if (commandLine === 'cmd1') {
        return Promise.resolve({stdout: 'out1', stderr: '', exitCode: 0});
      }
      return Promise.resolve({stdout: 'out2', stderr: '', exitCode: 0});
    });

    const res1 = await getCommandOutput('cmd1');
    const res2 = await getCommandOutput('cmd2');

    expect(res1).toBe('out1');
    expect(res2).toBe('out2');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should memoize same command with different cwd separately', async () => {
    const getExecOutputSpy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'out',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('cmd', 'dir1');
    await getCommandOutput('cmd', 'dir2');
    await getCommandOutput('cmd', 'dir1');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
    expect(getExecOutputSpy).toHaveBeenCalledWith('cmd', undefined, expect.objectContaining({cwd: 'dir1'}));
    expect(getExecOutputSpy).toHaveBeenCalledWith('cmd', undefined, expect.objectContaining({cwd: 'dir2'}));
  });

  it('should clear cache when resetCommandOutputCache is called', async () => {
    const getExecOutputSpy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'out',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('cmd');
    resetCommandOutputCache();
    await getCommandOutput('cmd');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });
});
