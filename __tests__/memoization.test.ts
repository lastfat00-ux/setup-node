import * as utils from '../src/cache-utils';
import * as exec from '@actions/exec';

describe('getCommandOutput memoization', () => {
  let getExecOutputSpy: jest.SpyInstance;

  beforeEach(() => {
    utils.resetCommandOutputCache();
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

    const out1 = await utils.getCommandOutput('node --version');
    const out2 = await utils.getCommandOutput('node --version');

    expect(out1).toBe('v1.2.3');
    expect(out2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });

  it('should use different cache for different commands', async () => {
    getExecOutputSpy.mockImplementation(async command => {
      if (command === 'cmd1') return {stdout: 'out1', stderr: '', exitCode: 0};
      if (command === 'cmd2') return {stdout: 'out2', stderr: '', exitCode: 0};
      return {stdout: '', stderr: '', exitCode: 1};
    });

    const out1 = await utils.getCommandOutput('cmd1');
    const out2 = await utils.getCommandOutput('cmd2');

    expect(out1).toBe('out1');
    expect(out2).toBe('out2');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should use different cache for different cwd', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'out',
      stderr: '',
      exitCode: 0
    });

    await utils.getCommandOutput('cmd', 'dir1');
    await utils.getCommandOutput('cmd', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should clear cache on resetCommandOutputCache', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'out',
      stderr: '',
      exitCode: 0
    });

    await utils.getCommandOutput('cmd');
    utils.resetCommandOutputCache();
    await utils.getCommandOutput('cmd');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    getExecOutputSpy.mockRejectedValueOnce(new Error('fail'));
    getExecOutputSpy.mockResolvedValue({
      stdout: 'success',
      stderr: '',
      exitCode: 0
    });

    await expect(utils.getCommandOutput('cmd')).rejects.toThrow('fail');
    const out = await utils.getCommandOutput('cmd');

    expect(out).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });
});
