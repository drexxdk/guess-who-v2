/* eslint-disable @typescript-eslint/no-require-imports */
import { logError, getErrorMessage } from "./logger";

describe("logger", () => {
  const originalEnv = process.env.NODE_ENV;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear module cache to get fresh logger instance
    jest.resetModules();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleDebugSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  describe("in development mode", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("logs messages with logger.log", () => {
      const { logger } = require("./logger");
      logger.log("test message");
      expect(consoleLogSpy).toHaveBeenCalledWith("test message");
    });

    it("logs warnings with logger.warn", () => {
      const { logger } = require("./logger");
      logger.warn("warning message");
      expect(consoleWarnSpy).toHaveBeenCalledWith("warning message");
    });

    it("logs errors with logger.error", () => {
      const { logger } = require("./logger");
      logger.error("error message");
      expect(consoleErrorSpy).toHaveBeenCalledWith("error message");
    });

    it("logs info with logger.info", () => {
      const { logger } = require("./logger");
      logger.info("info message");
      expect(consoleInfoSpy).toHaveBeenCalledWith("info message");
    });

    it("logs debug with logger.debug", () => {
      const { logger } = require("./logger");
      logger.debug("debug message");
      expect(consoleDebugSpy).toHaveBeenCalledWith("debug message");
    });

    it("handles multiple arguments", () => {
      const { logger } = require("./logger");
      logger.log("message", 123, { key: "value" });
      expect(consoleLogSpy).toHaveBeenCalledWith("message", 123, {
        key: "value",
      });
    });
  });

  describe("in production mode", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("does not log with logger.log", () => {
      const { logger } = require("./logger");
      logger.log("test message");
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("does not log with logger.warn", () => {
      const { logger } = require("./logger");
      logger.warn("warning message");
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("does not log with logger.error", () => {
      const { logger } = require("./logger");
      logger.error("error message");
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("does not log with logger.info", () => {
      const { logger } = require("./logger");
      logger.info("info message");
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it("does not log with logger.debug", () => {
      const { logger } = require("./logger");
      logger.debug("debug message");
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe("logError", () => {
    it("always logs errors even in production", () => {
      process.env.NODE_ENV = "production";
      logError("critical error");
      expect(consoleErrorSpy).toHaveBeenCalledWith("critical error");
    });

    it("handles multiple arguments", () => {
      logError("error:", new Error("test"), { context: "data" });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "error:",
        expect.any(Error),
        { context: "data" },
      );
    });
  });

  describe("getErrorMessage", () => {
    it("extracts message from Error objects", () => {
      const error = new Error("Something went wrong");
      expect(getErrorMessage(error)).toBe("Something went wrong");
    });

    it("converts strings to string", () => {
      expect(getErrorMessage("error string")).toBe("error string");
    });

    it("converts numbers to string", () => {
      expect(getErrorMessage(404)).toBe("404");
    });

    it("converts objects to string", () => {
      const obj = { code: "ERR_001" };
      expect(getErrorMessage(obj)).toBe("[object Object]");
    });

    it("handles null", () => {
      expect(getErrorMessage(null)).toBe("null");
    });

    it("handles undefined", () => {
      expect(getErrorMessage(undefined)).toBe("undefined");
    });
  });
});
