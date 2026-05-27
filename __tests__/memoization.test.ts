import * as exec from '@actions/core'; // Actually I need to mock @actions/exec
import * as cacheUtils from '../src/cache-utils';
import * as execOutput from '@actions/exec';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    cacheUtils.resetCommandOutputCache();
    jest.clearAllMocks();
  });

  it('should only call exec.getExecOutput once for the same command', async () => {
    const mockGetExecOutput = execOutput.getExecOutput as jest.Mock;
    mockGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3\n',
      stderr: '',
      exitCode: 0
    });

    const result1 = await cacheUtils.getCommandOutput('test-command');
    const result2 = await cacheUtils.getCommandOutput('test-command');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(mockGetExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should call exec.getExecOutput again after cache reset', async () => {
    const mockGetExecOutput = execOutput.getExecOutput as jest.Mock;
    mockGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3\n',
      stderr: '',
      exitCode: 0
    });

    await cacheUtils.getCommandOutput('test-command');
    cacheUtils.resetCommandOutputCache();
    await cacheUtils.getCommandOutput('test-command');

    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should distinguish between different commands', async () => {
    const mockGetExecOutput = execOutput.getExecOutput as jest.Mock;
    mockGetExecOutput.mockResolvedValue({
      stdout: 'output\n',
      stderr: '',
      exitCode: 0
    });

    await cacheUtils.getCommandOutput('command-1');
    await cacheUtils.getCommandOutput('command-2');

    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should distinguish between different working directories', async () => {
    const mockGetExecOutput = execOutput.getExecOutput as jest.Mock;
    mockGetExecOutput.mockResolvedValue({
      stdout: 'output\n',
      stderr: '',
      exitCode: 0
    });

    await cacheUtils.getCommandOutput('command', 'dir-1');
    await cacheUtils.getCommandOutput('command', 'dir-2');

    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });
});
