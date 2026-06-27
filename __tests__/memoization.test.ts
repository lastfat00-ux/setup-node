import * as exec from '@actions/exec';
import {
  getCommandOutput,
  getCommandOutputNotEmpty,
  resetCommandOutputCache
} from '../src/cache-utils';

describe('memoization tests', () => {
  const originalPath = process.env.PATH;

  beforeEach(() => {
    resetCommandOutputCache();
    jest.clearAllMocks();
    process.env.PATH = originalPath;
  });

  afterAll(() => {
    process.env.PATH = originalPath;
  });

  it('getCommandOutput should memoize results', async () => {
    const spy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'test-output',
      stderr: '',
      exitCode: 0
    });

    const result1 = await getCommandOutput('test-command');
    const result2 = await getCommandOutput('test-command');

    expect(result1).toBe('test-output');
    expect(result2).toBe('test-output');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('getCommandOutput should memoize results with cwd', async () => {
    const spy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'test-output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('test-command', 'dir1');
    await getCommandOutput('test-command', 'dir1');
    await getCommandOutput('test-command', 'dir2');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('getCommandOutput should invalidate on PATH change', async () => {
    const spy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'test-output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('test-command');
    process.env.PATH = '/new/path:' + originalPath;
    await getCommandOutput('test-command');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('getCommandOutput should not cache errors', async () => {
    const spy = jest.spyOn(exec, 'getExecOutput').mockRejectedValueOnce(new Error('fail')).mockResolvedValue({
      stdout: 'success',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('test-command')).rejects.toThrow('fail');
    const result = await getCommandOutput('test-command');

    expect(result).toBe('success');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('getCommandOutputNotEmpty should throw on empty output', async () => {
    jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: '  ',
      stderr: '',
      exitCode: 0
    });

    await expect(
      getCommandOutputNotEmpty('test-command', 'custom-error')
    ).rejects.toThrow('custom-error');
  });

  it('getCommandOutputNotEmpty should return output when not empty', async () => {
    jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
      stdout: 'actual-output',
      stderr: '',
      exitCode: 0
    });

    const result = await getCommandOutputNotEmpty('test-command', 'custom-error');
    expect(result).toBe('actual-output');
  });
});
