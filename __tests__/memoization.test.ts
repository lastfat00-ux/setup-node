import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
    let getExecOutputSpy: jest.SpyInstance;

    beforeEach(() => {
        resetCommandOutputCache();
        getExecOutputSpy = jest.spyOn(exec, 'getExecOutput');
        getExecOutputSpy.mockImplementation(async (commandLine, args, options) => {
            return {
                stdout: 'v1.2.3\n',
                stderr: '',
                exitCode: 0
            };
        });
    });

    afterEach(() => {
        getExecOutputSpy.mockRestore();
    });

    it('should call getExecOutput only once for the same command', async () => {
        const command = 'node --version';
        const result1 = await getCommandOutput(command);
        const result2 = await getCommandOutput(command);

        expect(result1).toBe('v1.2.3');
        expect(result2).toBe('v1.2.3');
        expect(getExecOutputSpy).toHaveBeenCalledTimes(1);
    });

    it('should call getExecOutput again after cache reset', async () => {
        const command = 'node --version';
        await getCommandOutput(command);
        resetCommandOutputCache();
        await getCommandOutput(command);

        expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
    });

    it('should call getExecOutput for different commands', async () => {
        await getCommandOutput('command1');
        await getCommandOutput('command2');

        expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
    });

    it('should call getExecOutput for different working directories', async () => {
        const command = 'node --version';
        await getCommandOutput(command, 'dir1');
        await getCommandOutput(command, 'dir2');

        expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
    });

    it('should not cache failed commands', async () => {
        getExecOutputSpy.mockImplementationOnce(async () => {
            return {
                stdout: '',
                stderr: 'error',
                exitCode: 1
            };
        });

        const command = 'fail';
        await expect(getCommandOutput(command)).rejects.toThrow('error');

        // Second call should try again
        getExecOutputSpy.mockImplementationOnce(async () => {
            return {
                stdout: 'success',
                stderr: '',
                exitCode: 0
            };
        });

        const result = await getCommandOutput(command);
        expect(result).toBe('success');
        expect(getExecOutputSpy).toHaveBeenCalledTimes(2);
    });
});
