import "@testing-library/jest-dom";
import "whatwg-fetch";
import { jest } from "@jest/globals";
import { TextEncoder, TextDecoder } from "node:util";

type TestGlobal = typeof globalThis & {
  __APP_API_URL__?: string;
  fetch: jest.MockedFunction<typeof fetch>;
};

const g = globalThis as TestGlobal;

g.TextEncoder = TextEncoder;
g.__APP_API_URL__ = "http://localhost:8000/api";
g.fetch = jest.fn(async () => new Response(JSON.stringify({}))) as jest.MockedFunction<typeof fetch>;

const silence = () => undefined;
jest.spyOn(console, "error").mockImplementation(silence);
jest.spyOn(console, "warn").mockImplementation(silence);
jest.spyOn(console, "log").mockImplementation(silence);
