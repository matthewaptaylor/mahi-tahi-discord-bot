/**
 * Generic event handler interface.
 */
export default interface EventHandler {
    process(...args: any[]): Promise<void>;
}
