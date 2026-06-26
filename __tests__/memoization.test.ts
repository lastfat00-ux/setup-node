import * as exec from '@actions/exec';
import {
  getCommandOutput,
  resetCommandOutputCache,
  getCommandOutputNotEmpty
} from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
  let spyGetExecOutput: jest.SpyInstance;

  beforeEach(() => {
    resetCommandOutputCache();
    spyGetExecOutput = jest.spyOn(exec, 'getExecOutput');
  });

  afterEach(() => {
    spyGetExecOutput.mockRestore();
  });

  it('should memoize command output', async () => {
    spyGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('node --version');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(spyGetExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should use different cache for different commands', async () => {
    spyGetExecOutput.mockImplementation(command => {
      if (command === 'node --version') {
        return Promise.resolve({stdout: 'v1.2.3', stderr: '', exitCode: 0});
      }
      return Promise.resolve({stdout: 'v4.5.6', stderr: '', exitCode: 0});
    });

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('npm --version');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v4.5.6');
    expect(spyGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should use different cache for different cwd', async () => {
    spyGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const result1 = await getCommandOutput('node --version', 'dir1');
    const result2 = await getCommandOutput('node --version', 'dir2');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(spyGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should clear cache when resetCommandOutputCache is called', async () => {
    spyGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version');
    resetCommandOutputCache();
    await getCommandOutput('node --version');

    expect(spyGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    spyGetExecOutput
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValue({
        stdout: 'v1.2.3',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('node --version')).rejects.toThrow('Failed');
    const result = await getCommandOutput('node --version');

    expect(result).toBe('v1.2.3');
    expect(spyGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('getCommandOutputNotEmpty should await and return output', async () => {
    spyGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const result = await getCommandOutputNotEmpty('node --version', 'Error');
    expect(result).toBe('v1.2.3');
  });

  it('getCommandOutputNotEmpty should throw if output is empty', async () => {
    spyGetExecOutput.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0
    });

    await expect(
      getCommandOutputNotEmpty('node --version', 'Output is empty')
    ).rejects.toThrow('Output is empty');
  });
});
