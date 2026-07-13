import * as exec from '@actions/exec';
import {
  getCommandOutput,
  getCommandOutputNotEmpty,
  resetCommandOutputCache
} from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  const mockedGetExecOutput = exec.getExecOutput as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    resetCommandOutputCache();
  });

  it('getCommandOutputNotEmpty should throw if output is empty', async () => {
    mockedGetExecOutput.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0
    });

    await expect(
      getCommandOutputNotEmpty('test command', 'error message')
    ).rejects.toThrow('error message');
  });

  it('getCommandOutput should be memoized', async () => {
    mockedGetExecOutput.mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    const res1 = await getCommandOutput('node --version');
    const res2 = await getCommandOutput('node --version');

    expect(res1).toBe('v1.0.0');
    expect(res2).toBe('v1.0.0');
    expect(mockedGetExecOutput).toHaveBeenCalledTimes(1);
  });

  it('getCommandOutput should return the same Promise instance for concurrent calls', async () => {
    mockedGetExecOutput.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                stdout: 'v1.0.0',
                stderr: '',
                exitCode: 0
              }),
            10
          )
        )
    );

    const p1 = getCommandOutput('node --version');
    const p2 = getCommandOutput('node --version');

    expect(p1).toBe(p2);
    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1).toBe('v1.0.0');
    expect(res2).toBe('v1.0.0');
    expect(mockedGetExecOutput).toHaveBeenCalledTimes(1);
  });

  it('getCommandOutput should not use cache if command is different', async () => {
    mockedGetExecOutput.mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command 1');
    await getCommandOutput('command 2');

    expect(mockedGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('getCommandOutput should not use cache if cwd is different', async () => {
    mockedGetExecOutput.mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir2');

    expect(mockedGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('getCommandOutput should remove from cache on failure', async () => {
    mockedGetExecOutput.mockRejectedValueOnce(new Error('fail'));
    mockedGetExecOutput.mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('command')).rejects.toThrow('fail');
    const res = await getCommandOutput('command');

    expect(res).toBe('v1.0.0');
    expect(mockedGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('resetCommandOutputCache should clear the cache', async () => {
    mockedGetExecOutput.mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command');
    resetCommandOutputCache();
    await getCommandOutput('command');

    expect(mockedGetExecOutput).toHaveBeenCalledTimes(2);
  });
});
