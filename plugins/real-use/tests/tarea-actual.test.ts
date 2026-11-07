import { describe, expect, test } from "claude-code/testing";

const TASKS = "- [~] Arreglar el guardado · hecho: no se pierde\n- [ ] Otra\n";

function stubs(on: (event: string, hook: (...args: unknown[]) => unknown) => void, percent: { n: number }) {
  on("session.start", (_$: unknown, e: { cwd?: string }) => ({ cwd: e.cwd }));
  on("session.cwd", () => ({ value: "/work" }));
  on("fs.read", () => ({ value: TASKS }));
  on("session.usage", () => ({
    value: { startedAt: 0, rateLimits: [], context: { tokens: 1000, window: 200_000, percent: percent.n } },
  }));
  on("turn.complete", () => ({ text: "" }));
}

async function mount(ui$: { session: { start: (e: object) => Promise<unknown> }; ui: { mount: (e: object) => Promise<Ui> } }, surface: string) {
  await ui$.session.start({ surface, isInteractive: true, cwd: "/work" });
  return ui$.ui.mount({
    plugin: "real-use",
    surface,
    component: "AbovePrompt",
    props: { hasSurvey: false, isWorking: false, maxRows: 4, bodyColumns: 80 },
  });
}

type Ui = {
  find: (q: { type: string; text: RegExp }) => Promise<unknown>;
  unmount: () => Promise<void>;
};

describe("tarea actual", () => {
  test("la banda muestra la tarea y el contexto en terminal y se actualiza", async ($, on) => {
    const percent = { n: 18 };
    stubs(on, percent);
    const ui = await mount($, "terminal");
    expect(await ui.find({ type: "Text", text: /Arreglar el guardado/ })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /ctx 18%/ })).toBeDefined();

    percent.n = 80;
    await $.turn.complete({ reason: "answer", answer: "ok", durationMs: 1 });
    expect(await ui.find({ type: "Text", text: /ctx 80%/ })).toBeDefined();
    await ui.unmount();
  });

  test("la misma banda se dibuja en el escritorio", async ($, on) => {
    stubs(on, { n: 42 });
    const ui = await mount($, "desktop");
    expect(await ui.find({ type: "Text", text: /Arreglar el guardado/ })).toBeDefined();
    expect(await ui.find({ type: "Text", text: /ctx 42%/ })).toBeDefined();
    await ui.unmount();
  });

  test("cede la banda si hay una encuesta", async ($, on) => {
    stubs(on, { n: 10 });
    on("ui.render", ($: { ui: { resolve: (e: unknown) => { Box: (p: object) => unknown; Text: (p: object) => unknown } } }, e: unknown) => {
      const { Box, Text } = $.ui.resolve(e);
      return Box({ children: [Text({ children: "encuesta" })] });
    });
    await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" });
    const ui = await $.ui.mount({
      plugin: "real-use",
      surface: "terminal",
      component: "AbovePrompt",
      props: { hasSurvey: true, isWorking: false, maxRows: 4, bodyColumns: 80 },
    });
    expect(await ui.find({ type: "Text", text: /Arreglar el guardado/ })).toBeUndefined();
    await ui.unmount();
  });
});
