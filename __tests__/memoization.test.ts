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

    const output1 = await getCommandOutput('node --version');
    const output2 = await getCommandOutput('node --version');

    expect(output1).toBe('v1.2.3');
    expect(output2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });

  it('should not memoize if command is different', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not memoize if cwd is different', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should clear cache when resetCommandOutputCache is called', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command');
    resetCommandOutputCache();
    await getCommandOutput('command');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should not cache failures', async () => {
    getExecOutputSpy
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('command')).rejects.toThrow('failed');
    const output = await getCommandOutput('command');

    expect(output).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle concurrent calls by returning the same promise', async () => {
    let resolveFirst: (value: any) => void = () => {};
    const firstCallPromise = new Promise(resolve => {
      resolveFirst = resolve;
    });

    getExecOutputSpy.mockImplementation(() => firstCallPromise);

    const promise1 = getCommandOutput('node --version');
    const promise2 = getCommandOutput('node --version');

    resolveFirst({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const [out1, out2] = await Promise.all([promise1, promise2]);

    expect(out1).toBe('v1.2.3');
    expect(out2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });
});
