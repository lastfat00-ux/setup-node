import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

jest.mock('@actions/exec');

describe('getCommandOutput memoization', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        resetCommandOutputCache();
    });

    it('should memoize command output', async () => {
        const mockGetExecOutput = exec.getExecOutput as jest.Mock;
        mockGetExecOutput.mockResolvedValue({
            stdout: 'v22.22.1',
            stderr: '',
            exitCode: 0
        });

        const result1 = await getCommandOutput('node --version');
        const result2 = await getCommandOutput('node --version');

        expect(result1).toBe('v22.22.1');
        expect(result2).toBe('v22.22.1');
        expect(mockGetExecOutput).toHaveBeenCalledTimes(1);
    });

    it('should not memoize across different commands', async () => {
        const mockGetExecOutput = exec.getExecOutput as jest.Mock;
        mockGetExecOutput.mockResolvedValue({
            stdout: 'output',
            stderr: '',
            exitCode: 0
        });

        await getCommandOutput('command1');
        await getCommandOutput('command2');

        expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
    });

    it('should not memoize across different directories', async () => {
        const mockGetExecOutput = exec.getExecOutput as jest.Mock;
        mockGetExecOutput.mockResolvedValue({
            stdout: 'output',
            stderr: '',
            exitCode: 0
        });

        await getCommandOutput('command', 'dir1');
        await getCommandOutput('command', 'dir2');

        expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
    });

    it('should clear cache if command fails', async () => {
        const mockGetExecOutput = exec.getExecOutput as jest.Mock;
        mockGetExecOutput
            .mockResolvedValueOnce({
                stdout: '',
                stderr: 'error',
                exitCode: 1
            })
            .mockResolvedValueOnce({
                stdout: 'success',
                stderr: '',
                exitCode: 0
            });

        await expect(getCommandOutput('fail-then-success')).rejects.toThrow('error');
        const result = await getCommandOutput('fail-then-success');

        expect(result).toBe('success');
        expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
    });

    it('should reset cache when resetCommandOutputCache is called', async () => {
        const mockGetExecOutput = exec.getExecOutput as jest.Mock;
        mockGetExecOutput.mockResolvedValue({
            stdout: 'output',
            stderr: '',
            exitCode: 0
        });

        await getCommandOutput('command');
        resetCommandOutputCache();
        await getCommandOutput('command');

        expect(mockGetExecOutput).toHaveBeenCalledTimes(2);
    });
});
