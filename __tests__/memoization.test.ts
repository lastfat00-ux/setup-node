
import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCommandOutputCache();
  });

  it('should call getExecOutput only once for the same command and cwd', async () => {
    const mockOutput = { stdout: 'v22.22.1', stderr: '', exitCode: 0 };
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('node --version');

    expect(result1).toBe('v22.22.1');
    expect(result2).toBe('v22.22.1');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should call getExecOutput multiple times for different commands', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });

    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should call getExecOutput multiple times for same command but different cwd', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should not cache failures', async () => {
    (exec.getExecOutput as jest.Mock)
      .mockRejectedValueOnce(new Error('failure'))
      .mockResolvedValueOnce({ stdout: 'success', stderr: '', exitCode: 0 });

    await expect(getCommandOutput('fail-then-success')).rejects.toThrow('failure');
    const result = await getCommandOutput('fail-then-success');

    expect(result).toBe('success');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should clear cache when resetCommandOutputCache is called', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });

    await getCommandOutput('cmd');
    resetCommandOutputCache();
    await getCommandOutput('cmd');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });
});
