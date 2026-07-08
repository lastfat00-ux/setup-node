import * as exec from '@actions/exec';
import {
  getCommandOutput,
  getCommandOutputNotEmpty,
  resetCommandOutputCache
} from '../src/cache-utils';

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
      stdout: 'v1.2.3\n',
      stderr: '',
      exitCode: 0
    });

    const output1 = await getCommandOutput('node --version');
    const output2 = await getCommandOutput('node --version');

    expect(output1).toBe('v1.2.3');
    expect(output2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });

  it('should use different cache keys for different commands', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should use different cache keys for different working directories', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle concurrent calls by returning the same promise', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise<any>(resolve => {
      resolvePromise = resolve;
    });

    getExecOutputSpy.mockReturnValue(promise);

    const call1 = getCommandOutput('node --version');
    const call2 = getCommandOutput('node --version');

    resolvePromise!({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const [res1, res2] = await Promise.all([call1, call2]);

    expect(res1).toBe('v1.2.3');
    expect(res2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });

  it('should not cache errors', async () => {
    getExecOutputSpy.mockResolvedValueOnce({
      stdout: '',
      stderr: 'error',
      exitCode: 1
    });

    await expect(getCommandOutput('fail')).rejects.toThrow('error');

    getExecOutputSpy.mockResolvedValueOnce({
      stdout: 'success',
      stderr: '',
      exitCode: 0
    });

    const output = await getCommandOutput('fail');
    expect(output).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should reset cache', async () => {
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

  it('getCommandOutputNotEmpty should correctly await and return output', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    const output = await getCommandOutputNotEmpty('command', 'error');
    expect(output).toBe('some output');
  });

  it('getCommandOutputNotEmpty should throw error if output is empty', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: '  ',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutputNotEmpty('command', 'custom error')).rejects.toThrow('custom error');
  });
});
