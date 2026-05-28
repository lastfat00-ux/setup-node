import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  const mockGetExecOutput = exec.getExecOutput as jest.MockedFunction<typeof exec.getExecOutput>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetCommandOutputCache();
  });

  it('should memoize command output', async () => {
    mockGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('node --version');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(mockGetExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should use different cache for different commands', async () => {
    mockGetExecOutput.mockResolvedValueOnce({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    }).mockResolvedValueOnce({
      stdout: '6.14.0',
      stderr: '',
      exitCode: 0
    });

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('npm --version');

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('6.14.0');
    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should use different cache for different cwd', async () => {
    mockGetExecOutput.mockResolvedValue({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
    expect(mockGetExecOutput).toHaveBeenCalledWith('node --version', undefined, { ignoreReturnCode: true, cwd: 'dir1' });
    expect(mockGetExecOutput).toHaveBeenCalledWith('node --version', undefined, { ignoreReturnCode: true, cwd: 'dir2' });
  });

  it('should clear cache on resetCommandOutputCache', async () => {
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

  it('should not cache failures', async () => {
    mockGetExecOutput.mockResolvedValueOnce({
      stdout: '',
      stderr: 'error',
      exitCode: 1
    }).mockResolvedValueOnce({
      stdout: 'v1.2.3',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('node --version')).rejects.toThrow('error');
    const result = await getCommandOutput('node --version');

    expect(result).toBe('v1.2.3');
    expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
  });
});
