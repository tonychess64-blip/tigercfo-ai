export type TauriInvoke = (cmd: string, args?: Record<string, unknown>) => Promise<any>;

export function getTauriInvoke(): TauriInvoke | null {
  const w = globalThis as any;
  if (w?.__TAURI__?.core?.invoke) {
    return w.__TAURI__.core.invoke as TauriInvoke;
  }
  return null;
}
