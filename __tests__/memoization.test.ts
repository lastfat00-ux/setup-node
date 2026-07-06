import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCommandOutputCache();
  });

  it('should call getExecOutput only once for the same command and cwd', async () => {
    const mockOutput = {
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    };

    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('node --version');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should call getExecOutput multiple times for different commands', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command1');
    await getCommandOutput('command2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should call getExecOutput multiple times for different cwds', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command', 'dir1');
    await getCommandOutput('command', 'dir2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should clear cache when resetCommandOutputCache is called', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('command');
    resetCommandOutputCache();
    await getCommandOutput('command');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should not cache errors', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValueOnce({
      stdout: '',
      stderr: 'error',
      exitCode: 1
    }).mockResolvedValueOnce({
      stdout: 'success',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('fail-then-succeed')).rejects.toThrow('error');
    const result = await getCommandOutput('fail-then-succeed');

    expect(result).toBe('success');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });
});
