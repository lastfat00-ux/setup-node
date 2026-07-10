import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetCommandOutputCache();
  });

  it('should call exec.getExecOutput only once for the same command', async () => {
    const mockOutput = {
      stdout: 'v22.0.0',
      stderr: '',
      exitCode: 0
    };
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    const result1 = await getCommandOutput('node --version');
    const result2 = await getCommandOutput('node --version');

    expect(result1).toBe('v22.0.0');
    expect(result2).toBe('v22.0.0');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should call exec.getExecOutput again if the cache is reset', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('some-command');
    resetCommandOutputCache();
    await getCommandOutput('some-command');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should use different cache keys for different working directories', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue({
      stdout: 'output',
      stderr: '',
      exitCode: 0
    });

    await getCommandOutput('node --version', 'dir1');
    await getCommandOutput('node --version', 'dir2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
    expect(exec.getExecOutput).toHaveBeenCalledWith('node --version', undefined, expect.objectContaining({ cwd: 'dir1' }));
    expect(exec.getExecOutput).toHaveBeenCalledWith('node --version', undefined, expect.objectContaining({ cwd: 'dir2' }));
  });

  it('should not cache failed commands', async () => {
    (exec.getExecOutput as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      });

    await expect(getCommandOutput('fail-then-success')).rejects.toThrow('Failed');
    const result = await getCommandOutput('fail-then-success');

    expect(result).toBe('success');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should return the same promise for concurrent calls', async () => {
    let resolve: (value: any) => void;
    const promise = new Promise(res => {
      resolve = res;
    });
    (exec.getExecOutput as jest.Mock).mockReturnValue(promise);

    const call1 = getCommandOutput('concurrent');
    const call2 = getCommandOutput('concurrent');

    resolve!({ stdout: 'done', stderr: '', exitCode: 0 });

    const [res1, res2] = await Promise.all([call1, call2]);

    expect(res1).toBe('done');
    expect(res2).toBe('done');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });
});
