import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    resetCommandOutputCache();
    spy = jest
      .spyOn(exec, 'getExecOutput')
      .mockImplementation(async (commandLine: string) => {
        return {
          stdout: 'v1.2.3\n',
          stderr: '',
          exitCode: 0
        } as any;
      });
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('should call exec.getExecOutput only once for the same command', async () => {
    const command = 'node --version';
    const result1 = await getCommandOutput(command);
    const result2 = await getCommandOutput(command);

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call exec.getExecOutput again after cache reset', async () => {
    const command = 'node --version';
    await getCommandOutput(command);
    resetCommandOutputCache();
    await getCommandOutput(command);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should use different cache keys for different working directories', async () => {
    const command = 'node --version';
    await getCommandOutput(command, 'dir1');
    await getCommandOutput(command, 'dir2');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed commands', async () => {
    const command = 'fail-command';
    spy.mockImplementationOnce(async () => {
      return {
        stdout: '',
        stderr: 'error',
        exitCode: 1
      } as any;
    });

    await expect(getCommandOutput(command)).rejects.toThrow('error');

    // Second call should try again
    spy.mockImplementationOnce(async () => {
      return {
        stdout: 'success',
        stderr: '',
        exitCode: 0
      } as any;
    });

    const result = await getCommandOutput(command);
    expect(result).toBe('success');
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
