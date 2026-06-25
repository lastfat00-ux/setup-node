import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  const mockedExec = exec as jest.Mocked<typeof exec>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetCommandOutputCache();
  });

  it('should cache command output', async () => {
    mockedExec.getExecOutput.mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    const output1 = await getCommandOutput('node --version');
    const output2 = await getCommandOutput('node --version');

    expect(output1).toBe('v1.0.0');
    expect(output2).toBe('v1.0.0');
    expect(mockedExec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should use different cache for different commands', async () => {
    mockedExec.getExecOutput.mockResolvedValueOnce({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    }).mockResolvedValueOnce({
      stdout: 'v2.0.0',
      stderr: '',
      exitCode: 0
    });

    const output1 = await getCommandOutput('node --version');
    const output2 = await getCommandOutput('npm --version');

    expect(output1).toBe('v1.0.0');
    expect(output2).toBe('v2.0.0');
    expect(mockedExec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should use different cache for different directories', async () => {
    mockedExec.getExecOutput.mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(mockedExec.getExecOutput).toHaveBeenCalledTimes(2);
    expect(mockedExec.getExecOutput).toHaveBeenCalledWith('node --version', undefined, expect.objectContaining({ cwd: 'dir1' }));
    expect(mockedExec.getExecOutput).toHaveBeenCalledWith('node --version', undefined, expect.objectContaining({ cwd: 'dir2' }));
  });

  it('should clear cache on resetCommandOutputCache', async () => {
    mockedExec.getExecOutput.mockResolvedValue({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version');
    resetCommandOutputCache();
    await getCommandOutput('node --version');

    expect(mockedExec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    mockedExec.getExecOutput.mockResolvedValueOnce({
      stdout: '',
      stderr: 'error',
      exitCode: 1
    }).mockResolvedValueOnce({
      stdout: 'v1.0.0',
      stderr: '',
      exitCode: 0
    });

    await expect(getCommandOutput('node --version')).rejects.toThrow('error');
    const output = await getCommandOutput('node --version');

    expect(output).toBe('v1.0.0');
    expect(mockedExec.getExecOutput).toHaveBeenCalledTimes(2);
  });
});
