
import * as exec from '@actions/exec';
import { getCommandOutput, resetCommandOutputCache } from '../src/cache-utils';

describe('getCommandOutput memoization', () => {
    it('should memoize command output', async () => {
        const execSpy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
            stdout: 'v1.2.3\n',
            stderr: '',
            exitCode: 0
        });

        // First call
        const out1 = await getCommandOutput('node --version');
        expect(out1).toBe('v1.2.3');
        expect(execSpy).toHaveBeenCalledTimes(1);

        // Second call (should be memoized)
        const out2 = await getCommandOutput('node --version');
        expect(out2).toBe('v1.2.3');
        expect(execSpy).toHaveBeenCalledTimes(1);

        // Reset cache
        resetCommandOutputCache();
        const out3 = await getCommandOutput('node --version');
        expect(out3).toBe('v1.2.3');
        expect(execSpy).toHaveBeenCalledTimes(2);

        execSpy.mockRestore();
    });

    it('should use different cache for different cwd', async () => {
        const execSpy = jest.spyOn(exec, 'getExecOutput').mockResolvedValue({
            stdout: 'some-output\n',
            stderr: '',
            exitCode: 0
        });

        await getCommandOutput('node --version', '/dir1');
        expect(execSpy).toHaveBeenCalledTimes(1);
        expect(execSpy).toHaveBeenLastCalledWith('node --version', undefined, expect.objectContaining({cwd: '/dir1'}));

        await getCommandOutput('node --version', '/dir2');
        expect(execSpy).toHaveBeenCalledTimes(2);
        expect(execSpy).toHaveBeenLastCalledWith('node --version', undefined, expect.objectContaining({cwd: '/dir2'}));

        // Call again with /dir1
        await getCommandOutput('node --version', '/dir1');
        expect(execSpy).toHaveBeenCalledTimes(2); // Should be memoized

        execSpy.mockRestore();
    });
});
