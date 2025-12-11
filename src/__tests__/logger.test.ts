import { logError, logInfo, logWarn } from "../utils/logger";

describe("logger", () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  it("emits info", () => {
    logInfo("info", { a: 1 });
    expect(console.log).toHaveBeenCalled();
  });

  it("emits warn", () => {
    logWarn("warn");
    expect(console.warn).toHaveBeenCalled();
  });

  it("emits error", () => {
    logError("err");
    expect(console.error).toHaveBeenCalled();
  });
});
