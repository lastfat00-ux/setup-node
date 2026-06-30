
import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetCommandOutputCache();
  });

  it('should call exec.getExecOutput only once for the same command', async () => {
    const mockGetExecOutput = exec.getExecOutput as jest.Mock;
    mockGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const output1 = await getCommandOutput('node --version');
    const output2 = await getCommandOutput('node --version');

    expect(output1).toBe('v1.2.3');
    expect(output2).toBe('v1.2.3');
    expect(mockGetExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should call exec.getExecOutput again after cache reset', async () => {
    const mockGetExecOutput = exec.getExecOutput as jest.Mock;
    mockGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version');
    resetCommandOutputCache();
    await getCommandOutput('node --version');

    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should call exec.getExecOutput for different commands', async () => {
    const mockGetExecOutput = exec.getExecOutput as jest.Mock;
    mockGetExecOutput.mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version');
    await getCommandOutput('npm --version');

    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should call exec.getExecOutput for different directories', async () => {
    const mockGetExecOutput = exec.getExecOutput as jest.Mock;
    mockGetExecOutput.mockResolvedValue({
      stdout: 'some output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should remove from cache if command fails', async () => {
    const mockGetExecOutput = exec.getExecOutput as jest.Mock;
    mockGetExecOutput
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('fail-command')).rejects.toThrow('Failed');
    const output = await getCommandOutput('fail-command');

    expect(output).toBe('success');
    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });
});
