import React from "react";
import { renderHook } from "@testing-library/react";
import {
  ThemeProvider,
  useThemeConfig,
  ThemeConfig,
} from "@/app/reactvideoeditor/pro/contexts/theme-context";
import { CustomTheme } from "@/app/reactvideoeditor/pro/hooks/use-extended-theme-switcher";

describe("ThemeContext", () => {
  // Mock custom themes for testing
  const mockCustomThemes: CustomTheme[] = [
    {
      id: "purple",
      name: "Purple",
      color: "#8b5cf6",
      className: "theme-purple",
    },
    {
      id: "green",
      name: "Green",
      color: "#10b981",
      className: "theme-green",
      icon: <span>🟢</span>,
    },
    {
      id: "blue",
      name: "Blue",
      color: "#3b82f6",
    },
  ];

  const mockOnThemeChange = jest.fn();

  const defaultConfig: ThemeConfig = {
    availableThemes: mockCustomThemes,
    selectedTheme: "purple",
    onThemeChange: mockOnThemeChange,
    showDefaultThemes: true,
    hideThemeToggle: false,
    defaultTheme: "dark",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useThemeConfig hook", () => {
    it("should return null when used outside of ThemeProvider", () => {
      const { result } = renderHook(() => useThemeConfig());
      expect(result.current).toBeNull();
    });

    it("should return the theme config when used within ThemeProvider", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={defaultConfig}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current).toEqual(defaultConfig);
      expect(result.current?.availableThemes).toHaveLength(3);
      expect(result.current?.selectedTheme).toBe("purple");
      expect(result.current?.showDefaultThemes).toBe(true);
      expect(result.current?.hideThemeToggle).toBe(false);
      expect(result.current?.defaultTheme).toBe("dark");
    });

    it("should return updated config when provider config changes", () => {
      const updatedConfig: ThemeConfig = {
        ...defaultConfig,
        selectedTheme: "green",
        hideThemeToggle: true,
      };

      let config = defaultConfig;
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={config}>{children}</ThemeProvider>
      );

      const { result, rerender } = renderHook(() => useThemeConfig(), {
        wrapper,
      });

      expect(result.current?.selectedTheme).toBe("purple");
      expect(result.current?.hideThemeToggle).toBe(false);

      // Update config and rerender
      config = updatedConfig;
      rerender();

      expect(result.current?.selectedTheme).toBe("green");
      expect(result.current?.hideThemeToggle).toBe(true);
    });
  });

  describe("ThemeProvider", () => {
    it("should provide theme config to child components", () => {
      const TestComponent = () => {
        const config = useThemeConfig();
        return <div data-testid="config">{JSON.stringify(config)}</div>;
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={defaultConfig}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current).not.toBeNull();
      expect(result.current?.availableThemes).toEqual(mockCustomThemes);
      expect(result.current?.onThemeChange).toBe(mockOnThemeChange);
    });

    it("should handle empty config", () => {
      const emptyConfig: ThemeConfig = {};
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={emptyConfig}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current).toEqual(emptyConfig);
      expect(result.current?.availableThemes).toBeUndefined();
      expect(result.current?.selectedTheme).toBeUndefined();
      expect(result.current?.onThemeChange).toBeUndefined();
    });

    it("should handle config with only some properties", () => {
      const partialConfig: ThemeConfig = {
        selectedTheme: "dark",
        hideThemeToggle: true,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={partialConfig}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current?.selectedTheme).toBe("dark");
      expect(result.current?.hideThemeToggle).toBe(true);
      expect(result.current?.availableThemes).toBeUndefined();
      expect(result.current?.showDefaultThemes).toBeUndefined();
    });
  });

  describe("Theme configuration properties", () => {
    it("should handle availableThemes array", () => {
      const config: ThemeConfig = {
        availableThemes: mockCustomThemes,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={config}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current?.availableThemes).toHaveLength(3);
      expect(result.current?.availableThemes?.[0]).toEqual({
        id: "purple",
        name: "Purple",
        color: "#8b5cf6",
        className: "theme-purple",
      });
      expect(result.current?.availableThemes?.[1]).toEqual({
        id: "green",
        name: "Green",
        color: "#10b981",
        className: "theme-green",
        icon: <span>🟢</span>,
      });
    });

    it("should handle onThemeChange callback", () => {
      const config: ThemeConfig = {
        onThemeChange: mockOnThemeChange,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={config}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current?.onThemeChange).toBe(mockOnThemeChange);
      expect(typeof result.current?.onThemeChange).toBe("function");
    });

    it("should handle boolean flags correctly", () => {
      const config: ThemeConfig = {
        showDefaultThemes: false,
        hideThemeToggle: true,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={config}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current?.showDefaultThemes).toBe(false);
      expect(result.current?.hideThemeToggle).toBe(true);
    });

    it("should handle string properties", () => {
      const config: ThemeConfig = {
        selectedTheme: "custom-theme",
        defaultTheme: "light",
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={config}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current?.selectedTheme).toBe("custom-theme");
      expect(result.current?.defaultTheme).toBe("light");
    });
  });

  describe("Nested providers", () => {
    it("should use the closest provider's config", () => {
      const outerConfig: ThemeConfig = {
        selectedTheme: "outer",
        hideThemeToggle: false,
      };

      const innerConfig: ThemeConfig = {
        selectedTheme: "inner",
        hideThemeToggle: true,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={outerConfig}>
          <ThemeProvider config={innerConfig}>{children}</ThemeProvider>
        </ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current?.selectedTheme).toBe("inner");
      expect(result.current?.hideThemeToggle).toBe(true);
    });
  });

  describe("Type safety", () => {
    it("should maintain proper TypeScript types", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={defaultConfig}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      // Type assertions to ensure proper typing
      const config = result.current;
      if (config) {
        expect(Array.isArray(config.availableThemes)).toBe(true);
        expect(typeof config.selectedTheme).toBe("string");
        expect(typeof config.onThemeChange).toBe("function");
        expect(typeof config.showDefaultThemes).toBe("boolean");
        expect(typeof config.hideThemeToggle).toBe("boolean");
        expect(typeof config.defaultTheme).toBe("string");
      }
    });

    it("should handle undefined values gracefully", () => {
      const configWithUndefined: ThemeConfig = {
        availableThemes: undefined,
        selectedTheme: undefined,
        onThemeChange: undefined,
        showDefaultThemes: undefined,
        hideThemeToggle: undefined,
        defaultTheme: undefined,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider config={configWithUndefined}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeConfig(), { wrapper });

      expect(result.current?.availableThemes).toBeUndefined();
      expect(result.current?.selectedTheme).toBeUndefined();
      expect(result.current?.onThemeChange).toBeUndefined();
      expect(result.current?.showDefaultThemes).toBeUndefined();
      expect(result.current?.hideThemeToggle).toBeUndefined();
      expect(result.current?.defaultTheme).toBeUndefined();
    });
  });
}); 