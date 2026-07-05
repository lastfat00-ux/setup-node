import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
  const toolCommand = 'node --version';
  const mockOutput = {
    stdout: 'v20.0.0',
    stderr: '',
    exitCode: 0
  };

  beforeEach(() => {
    jest.resetAllMocks();
    resetCommandOutputCache();
  });

  it('should call exec.getExecOutput only once for the same command', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    const result1 = await getCommandOutput(toolCommand);
    const result2 = await getCommandOutput(toolCommand);

    expect(result1).toBe('v20.0.0');
    expect(result2).toBe('v20.0.0');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(1);
  });

  it('should call exec.getExecOutput again after cache reset', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    await getCommandOutput(toolCommand);
    resetCommandOutputCache();
    await getCommandOutput(toolCommand);

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should use different cache for different cwd', async () => {
    (exec.getExecOutput as jest.Mock).mockResolvedValue(mockOutput);

    await getCommandOutput(toolCommand, 'dir1');
    await getCommandOutput(toolCommand, 'dir2');

    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    (exec.getExecOutput as jest.Mock)
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce(mockOutput);

    await expect(getCommandOutput(toolCommand)).rejects.toThrow('failed');
    const result = await getCommandOutput(toolCommand);

    expect(result).toBe('v20.0.0');
    expect(exec.getExecOutput).toHaveBeenCalledTimes(2);
  });
});
