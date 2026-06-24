import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  const mockedGetExecOutput = exec.getExecOutput as jest.MockedFunction<typeof exec.getExecOutput>;

  beforeEach(() => {
    resetCommandOutputCache();
    jest.clearAllMocks();
  });

  it('should cache the output of a command', async () => {
    mockedGetExecOutput.mockResolvedValue({
      stdout: 'v22.22.1\n',
      stderr: '',
      exitCode: 0
    });

    const output1 = await getCommandOutput('node --version');
    const output2 = await getCommandOutput('node --version');

    expect(output1).toBe('v22.22.1');
    expect(output2).toBe('v22.22.1');
    expect(mockedGetExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should cache based on command and cwd', async () => {
    mockedGetExecOutput.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir2');

    expect(mockedGetExecOutput).toHaveBeenCalledTimes(2);
    expect(mockedGetExecOutput).toHaveBeenCalledWith('command', undefined, {
      ignoreReturnCode: true,
      cwd: 'dir1'
    });
    expect(mockedGetExecOutput).toHaveBeenCalledWith('command', undefined, {
      ignoreReturnCode: true,
      cwd: 'dir2'
    });
  });

  it('should not cache failed commands', async () => {
    mockedGetExecOutput
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('fail')).rejects.toThrow('failed');
    const output = await getCommandOutput('fail');

    expect(output).toBe('success');
    expect(mockedGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should not cache commands that return non-zero exit code', async () => {
    mockedGetExecOutput
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

    await expect(getCommandOutput('exit1')).rejects.toThrow('error');
    const output = await getCommandOutput('exit1');

    expect(output).toBe('success');
    expect(mockedGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('resetCommandOutputCache should clear the cache', async () => {
    mockedGetExecOutput.mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('cmd');
    resetCommandOutputCache();
    await getCommandOutput('cmd');

    expect(mockedGetExecOutput).toHaveBeenCalledTimes(2);
  });
});
