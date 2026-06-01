import * as exec from '@actions/exec';
import {getCommandOutput, resetCommandOutputCache} from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
  let getExecOutputSpy: jest.SpyInstance;

  beforeEach(() => {
    resetCommandOutputCache();
    getExecOutputSpy = jest.spyOn(exec, 'getExecOutput');
    getExecOutputSpy.mockImplementation(() =>
      Promise.resolve({
        stdout: 'v1.2.3',
        stderr: '',
        exitCode: 0
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call getExecOutput only once for the same command', async () => {
    const command = 'node --version';

    const result1 = await getCommandOutput(command);
    const result2 = await getCommandOutput(command);

    expect(result1).toBe('v1.2.3');
    expect(result2).toBe('v1.2.3');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
  });

  it('should call getExecOutput multiple times for different commands', async () => {
    await getCommandOutput('node --version');
    await getCommandOutput('npm --version');

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should call getExecOutput again after cache reset', async () => {
    const command = 'node --version';

    await getCommandOutput(command);
    resetCommandOutputCache();
    await getCommandOutput(command);

    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });

  it('should remove failed commands from cache', async () => {
    const command = 'fail-command';
    getExecOutputSpy.mockImplementationOnce(() =>
      Promise.resolve({
        stdout: '',
        stderr: 'error',
        exitCode: 1
      })
    );

    await expect(getCommandOutput(command)).rejects.toThrow('error');

    getExecOutputSpy.mockImplementationOnce(() =>
      Promise.resolve({
        stdout: 'success',
        stderr: '',
        exitCode: 0
      })
    );

    const result = await getCommandOutput(command);
    expect(result).toBe('success');
    expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
  });
});
