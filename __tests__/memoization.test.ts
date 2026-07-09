
import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  const toolCommand = 'node --version';
  const mockStdout = 'v20.0.0';

  beforeEach(() => {
    jest.clearAllMocks();
    resetCommandOutputCache();
    (exec.getExecOutput as jest.Mock).mockResolvedValue({
      stdout: mockStdout,
      stderr: '',
      exitCode: 0
    });
  });

  it('should call exec.getExecOutput only once for the same command', async () => {
    const result1 = await getCommandOutput(toolCommand);
    const result2 = await getCommandOutput(toolCommand);

    expect(result1).toBe(mockStdout);
    expect(result2).toBe(mockStdout);
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should return the same promise for concurrent calls', async () => {
    const promise1 = getCommandOutput(toolCommand);
    const promise2 = getCommandOutput(toolCommand);

    expect(promise1).toBe(promise2);

    const [res1, res2] = await Promise.all([promise1, promise2]);
    expect(res1).toBe(mockStdout);
    expect(res2).toBe(mockStdout);
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should call exec.getExecOutput again after cache reset', async () => {
    await getCommandOutput(toolCommand);
    resetCommandOutputCache();
    await getCommandOutput(toolCommand);

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should differentiate between different commands', async () => {
    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should differentiate between different directories', async () => {
    await getCommandOutput(toolCommand, 'dir1');
    await getCommandOutput(toolCommand, 'dir2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should not cache errors', async () => {
    (exec.getExecOutput as jest.Mock).mockRejectedValueOnce(new Error('failed'));

    await expect(getCommandOutput(toolCommand)).rejects.toThrow('failed');

    (exec.getExecOutput as jest.Mock).mockResolvedValue({
      stdout: mockStdout,
      stderr: '',
      exitCode: 0
    });

    const result = await getCommandOutput(toolCommand);
    expect(result).toBe(mockStdout);
    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });
});
