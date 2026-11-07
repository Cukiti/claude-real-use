export type TareaActual = { task: string | null; percent: number | null };

declare module "claude-code" {
  interface PluginState {
    "real-use": { banda: TareaActual };
  }
}
