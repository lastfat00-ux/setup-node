import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCommandOutputCache();
  });

  it('should only call exec.getExecOutput once for the same command and cwd', async () => {
    const mockOutput = {
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    };
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    const command = 'node --version';
    const cwd = '/path/to/project';

    const result1 = await getCommandOutput(command, cwd);
    const result2 = await getCommandOutput(command, cwd);

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
    expect(exec.getExecOutput).toHaveBeenCalledWith(command, undefined, {
      ignoreReturnCode: true,
      cwd
    });
  });

  it('should call exec.getExecOutput again if the command or cwd is different', async () => {
    const mockOutput = {
      stdout: 'success',
      stderr: '',
      exitCode: 0
    };
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    await getCommandOutput('command1', 'dir1');
    await getCommandOutput('command1', 'dir2');
    await getCommandOutput('command2', 'dir1');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(3);
  });

  it('should call exec.getExecOutput again after cache reset', async () => {
    const mockOutput = {
      stdout: 'success',
      stderr: '',
      exitCode: 0
    };
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    await getCommandOutput('command');
    resetCommandOutputCache();
    await getCommandOutput('command');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should handle concurrent calls and only execute once', async () => {
    const mockOutput = {
      stdout: 'success',
      stderr: '',
      exitCode: 0
    };
    (exec.getExecOutput as jest.Mock).mockImplementation(async () => {
        // Add a small delay to simulate async work
        await new Promise(resolve => setTimeout(resolve, 10));
        return mockOutput;
    });

    const results = await Promise.all([
      getCommandOutput('concurrent'),
      getCommandOutput('concurrent'),
      getCommandOutput('concurrent')
    ]);

    expect(results).toEqual(['success', 'success', 'success']);
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should not cache failed commands', async () => {
    (exec.getExecOutput as jest.Mock)
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('fail-then-success')).rejects.toThrow('First failure');
    const result = await getCommandOutput('fail-then-success');

    expect(result).toBe('success');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });
});
