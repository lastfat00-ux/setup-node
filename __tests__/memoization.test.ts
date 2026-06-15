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

  it('should memoize the output of the command', async () => {
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

  it('should not memoize if cwd is different', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should remove failed promises from cache', async () => {
    getExecOutputSpy.mockRejectedValueOnce(new Error('command failed'));
    getExecOutputSpy.mockResolvedValueOnce({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('node --version')).rejects.toThrow(
      'command failed'
    );
    const result = await getCommandOutput('node --version');

    expect(result).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should clear cache when resetCommandOutputCache is called', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version');
    resetCommandOutputCache();
    await getCommandOutput('node --version');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle concurrent calls by returning the same promise', async () => {
    getExecOutputSpy.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const [result1, result2] = await Promise.all([
      getCommandOutput('node --version'),
      getCommandOutput('node --version')
    ]);

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });
});
