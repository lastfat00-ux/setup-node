import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetCommandOutputCache();
  });

  it('should call getExecOutput only once for the same command and cwd', async () => {
    const mockOutput = {
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    };
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    const command = 'node --version';
    const result1 = await getCommandOutput(command);
    const result2 = await getCommandOutput(command);

    expect(result1).toBe('v1.0.0');
    expect(result2).toBe('v1.0.0');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should call getExecOutput multiple times for different commands', async () => {
    (exec.getExecOutput as jest.Mock).mockImplementation((command: string) => {
      if (command === 'node --version') {
        return Promise.resolve({stdout: 'v16.0.0', stderr: '', exitCode: 0});
      }
      return Promise.resolve({stdout: '7.0.0', stderr: '', exitCode: 0});
    });

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('npm --version');

    expect(result1).toBe('v16.0.0');
    expect(result2).toBe('7.0.0');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should call getExecOutput multiple times for different cwds', async () => {
    const mockOutput = {
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    };
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    const command = 'node --version';
    await getCommandOutput(command, 'dir1');
    await getCommandOutput(command, 'dir2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should not cache failures', async () => {
    (exec.getExecOutput as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({stdout: 'success', stderr: '', exitCode: 0});

    const command = 'fail-then-success';

    await expect(getCommandOutput(command)).rejects.toThrow('Failed');
    const result = await getCommandOutput(command);

    expect(result).toBe('success');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should reset cache', async () => {
    const mockOutput = {
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    };
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    const command = 'node --version';
    await getCommandOutput(command);
    resetCommandOutputCache();
    await getCommandOutput(command);

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });
});
