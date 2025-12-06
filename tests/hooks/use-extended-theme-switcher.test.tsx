import { renderHook, act } from "@testing-library/react";
import { useExtendedThemeSwitcher, CustomTheme, ExtendedThemeMode } from "../../app/reactvideoeditor/pro/hooks/use-extended-theme-switcher";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock document.documentElement
const createMockDocumentElement = () => {
  const classes = new Set<string>();
  const attributes: Record<string, string> = {};

  return {
    classList: {
      add: jest.fn((className: string) => classes.add(className)),
      remove: jest.fn((className: string) => classes.delete(className)),
      contains: (className: string) => classes.has(className),
      toString: () => Array.from(classes).join(" "),
    },
    setAttribute: jest.fn((key: string, value: string) => {
      attributes[key] = value;
    }),
    getAttribute: (key: string) => attributes[key] || null,
    _reset: () => {
      classes.clear();
      Object.keys(attributes).forEach(key => delete attributes[key]);
    },
  };
};

describe("useExtendedThemeSwitcher", () => {
  let mockDocumentElement: ReturnType<typeof createMockDocumentElement>;
  let originalDocument: any;

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();

    // Store original document
    originalDocument = global.document;

    // Setup document mock
    mockDocumentElement = createMockDocumentElement();
    
    if (typeof global.document !== 'undefined') {
      Object.defineProperty(global.document, "documentElement", {
        value: mockDocumentElement,
        writable: true,
        configurable: true,
      });
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    if (mockDocumentElement) {
      mockDocumentElement._reset();
    }
    // Restore original document
    if (originalDocument) {
      global.document = originalDocument;
    }
  });

  describe("initialization", () => {
    it("should initialize with default dark theme", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      expect(result.current.currentTheme).toBe("dark");
      expect(result.current.availableThemes).toHaveLength(2);
    });

    it("should initialize with custom default theme", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ defaultTheme: "light" })
      );

      expect(result.current.currentTheme).toBe("light");
    });

    it("should load saved theme from localStorage", () => {
      localStorageMock.setItem("rve-extended-theme", "light");

      const { result } = renderHook(() => useExtendedThemeSwitcher());

      // Wait for effect to run
      act(() => {
        // Effect runs automatically
      });

      expect(result.current.currentTheme).toBe("light");
    });

    it("should use default theme when no saved theme exists", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ defaultTheme: "dark" })
      );

      expect(result.current.currentTheme).toBe("dark");
    });

    it("should include default themes when showDefaultThemes is true", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ showDefaultThemes: true })
      );

      expect(result.current.availableThemes).toHaveLength(2);
      expect(result.current.availableThemes[0].id).toBe("light");
      expect(result.current.availableThemes[1].id).toBe("dark");
    });

    it("should exclude default themes when showDefaultThemes is false", () => {
      const customThemes: CustomTheme[] = [
        { id: "custom", name: "Custom", color: "#ff0000" },
      ];

      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({
          showDefaultThemes: false,
          customThemes,
        })
      );

      expect(result.current.availableThemes).toHaveLength(1);
      expect(result.current.availableThemes[0].id).toBe("custom");
    });
  });

  describe("setTheme", () => {
    it("should update current theme when setTheme is called", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      act(() => {
        result.current.setTheme("light");
      });

      expect(result.current.currentTheme).toBe("light");
    });

    it("should save theme to localStorage when setTheme is called", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      act(() => {
        result.current.setTheme("light");
      });

      expect(localStorageMock.getItem("rve-extended-theme")).toBe("light");
    });

    it("should apply dark class when setting dark theme", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      act(() => {
        result.current.setTheme("dark");
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith("dark");
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "dark"
      );
    });

    it("should not apply class for light theme", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ defaultTheme: "dark" })
      );

      mockDocumentElement.classList.add.mockClear();

      act(() => {
        result.current.setTheme("light");
      });

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "light"
      );
      // Light theme shouldn't add any class
      expect(mockDocumentElement.classList.add).not.toHaveBeenCalledWith(
        "light"
      );
    });

    it("should switch between themes correctly", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      act(() => {
        result.current.setTheme("light");
      });

      expect(result.current.currentTheme).toBe("light");

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.currentTheme).toBe("dark");
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith("dark");
    });

    it("should update localStorage on multiple theme changes", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      act(() => {
        result.current.setTheme("light");
      });

      expect(localStorageMock.getItem("rve-extended-theme")).toBe("light");

      act(() => {
        result.current.setTheme("dark");
      });

      expect(localStorageMock.getItem("rve-extended-theme")).toBe("dark");
    });
  });

  describe("custom themes", () => {
    const customThemes: CustomTheme[] = [
      {
        id: "sunset",
        name: "Sunset",
        className: "theme-sunset",
        color: "#ff6b6b",
      },
      {
        id: "ocean",
        name: "Ocean",
        className: "theme-ocean",
        color: "#4ecdc4",
      },
      {
        id: "forest",
        name: "Forest",
        color: "#95e1d3",
      },
    ];

    it("should include custom themes in availableThemes", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      expect(result.current.availableThemes).toHaveLength(5); // 2 default + 3 custom
      expect(result.current.availableThemes[2].id).toBe("sunset");
      expect(result.current.availableThemes[3].id).toBe("ocean");
      expect(result.current.availableThemes[4].id).toBe("forest");
    });

    it("should apply custom theme className when set", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result.current.setTheme("sunset");
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
        "theme-sunset"
      );
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "sunset"
      );
    });

    it("should handle custom theme without className", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result.current.setTheme("forest");
      });

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "forest"
      );
      // Should not add any class since forest theme has no className
      expect(mockDocumentElement.classList.add).not.toHaveBeenCalledWith(
        "theme-forest"
      );
    });

    it("should remove previous theme classes when switching themes", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result.current.setTheme("sunset");
      });

      mockDocumentElement.classList.remove.mockClear();

      act(() => {
        result.current.setTheme("ocean");
      });

      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith("dark");
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith(
        "theme-sunset"
      );
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith(
        "theme-ocean"
      );
    });

    it("should switch from custom theme to default theme", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result.current.setTheme("sunset");
      });

      expect(result.current.currentTheme).toBe("sunset");

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.currentTheme).toBe("dark");
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith("dark");
    });

    it("should save custom theme to localStorage", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result.current.setTheme("ocean");
      });

      expect(localStorageMock.getItem("rve-extended-theme")).toBe("ocean");
    });

    it("should load saved custom theme from localStorage", () => {
      localStorageMock.setItem("rve-extended-theme", "sunset");

      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        // Wait for effect
      });

      expect(result.current.currentTheme).toBe("sunset");
    });

    it("should fallback to default if saved theme is not in available themes", () => {
      localStorageMock.setItem("rve-extended-theme", "nonexistent");

      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({
          customThemes,
          defaultTheme: "dark",
        })
      );

      expect(result.current.currentTheme).toBe("dark");
    });
  });

  describe("getThemeInfo", () => {
    const customThemes: CustomTheme[] = [
      {
        id: "sunset",
        name: "Sunset",
        className: "theme-sunset",
        color: "#ff6b6b",
      },
    ];

    it("should return theme info for default light theme", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      const themeInfo = result.current.getThemeInfo("light");

      expect(themeInfo).toBeDefined();
      expect(themeInfo?.id).toBe("light");
      expect(themeInfo?.name).toBe("Light");
      expect(themeInfo?.color).toBe("#ffffff");
    });

    it("should return theme info for default dark theme", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      const themeInfo = result.current.getThemeInfo("dark");

      expect(themeInfo).toBeDefined();
      expect(themeInfo?.id).toBe("dark");
      expect(themeInfo?.name).toBe("Dark");
      expect(themeInfo?.className).toBe("dark");
      expect(themeInfo?.color).toBe("#1f2937");
    });

    it("should return theme info for custom theme", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      const themeInfo = result.current.getThemeInfo("sunset");

      expect(themeInfo).toBeDefined();
      expect(themeInfo?.id).toBe("sunset");
      expect(themeInfo?.name).toBe("Sunset");
      expect(themeInfo?.className).toBe("theme-sunset");
      expect(themeInfo?.color).toBe("#ff6b6b");
    });

    it("should return undefined for non-existent theme", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      const themeInfo = result.current.getThemeInfo("nonexistent");

      expect(themeInfo).toBeUndefined();
    });

    it("should return correct info after theme changes", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result.current.setTheme("sunset");
      });

      const themeInfo = result.current.getThemeInfo(result.current.currentTheme);

      expect(themeInfo?.id).toBe("sunset");
    });
  });

  describe("availableThemes", () => {
    it("should return all default themes when no custom themes provided", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      expect(result.current.availableThemes).toHaveLength(2);
      expect(result.current.availableThemes.map((t) => t.id)).toEqual([
        "light",
        "dark",
      ]);
    });

    it("should combine default and custom themes", () => {
      const customThemes: CustomTheme[] = [
        { id: "custom1", name: "Custom 1" },
        { id: "custom2", name: "Custom 2" },
      ];

      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      expect(result.current.availableThemes).toHaveLength(4);
      expect(result.current.availableThemes.map((t) => t.id)).toEqual([
        "light",
        "dark",
        "custom1",
        "custom2",
      ]);
    });

    it("should update when customThemes prop changes", () => {
      const customThemes1: CustomTheme[] = [
        { id: "custom1", name: "Custom 1" },
      ];

      const { result, rerender } = renderHook(
        ({ themes }) => useExtendedThemeSwitcher({ customThemes: themes }),
        { initialProps: { themes: customThemes1 } }
      );

      expect(result.current.availableThemes).toHaveLength(3);

      const customThemes2: CustomTheme[] = [
        { id: "custom1", name: "Custom 1" },
        { id: "custom2", name: "Custom 2" },
      ];

      rerender({ themes: customThemes2 });

      expect(result.current.availableThemes).toHaveLength(4);
    });

    it("should maintain stability when customThemes reference doesn't change", () => {
      const customThemes: CustomTheme[] = [
        { id: "custom1", name: "Custom 1" },
      ];

      const { result, rerender } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      const firstThemes = result.current.availableThemes;
      rerender();
      const secondThemes = result.current.availableThemes;

      expect(firstThemes).toBe(secondThemes); // Same reference
    });
  });

  describe("edge cases", () => {
    it("should handle empty custom themes array", () => {
      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes: [] })
      );

      expect(result.current.availableThemes).toHaveLength(2);
    });

    it("should handle rapid theme changes", () => {
      const { result } = renderHook(() => useExtendedThemeSwitcher());

      act(() => {
        result.current.setTheme("light");
        result.current.setTheme("dark");
        result.current.setTheme("light");
        result.current.setTheme("dark");
      });

      expect(result.current.currentTheme).toBe("dark");
      expect(localStorageMock.getItem("rve-extended-theme")).toBe("dark");
    });

    it("should handle theme with all optional properties", () => {
      const customThemes: CustomTheme[] = [
        {
          id: "minimal",
          name: "Minimal Theme",
          icon: undefined,
          className: undefined,
          color: undefined,
        },
      ];

      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result.current.setTheme("minimal");
      });

      expect(result.current.currentTheme).toBe("minimal");
    });

    it("should handle special characters in theme IDs", () => {
      const customThemes: CustomTheme[] = [
        {
          id: "theme-with-dashes",
          name: "Theme With Dashes",
          className: "theme-with-dashes",
        },
      ];

      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result.current.setTheme("theme-with-dashes");
      });

      expect(result.current.currentTheme).toBe("theme-with-dashes");
      expect(localStorageMock.getItem("rve-extended-theme")).toBe(
        "theme-with-dashes"
      );
    });
  });

  describe("integration tests", () => {
    it("should handle complete workflow with custom themes", () => {
      const customThemes: CustomTheme[] = [
        {
          id: "brand",
          name: "Brand Theme",
          className: "theme-brand",
          color: "#007bff",
        },
      ];

      localStorageMock.setItem("rve-extended-theme", "brand");

      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes, defaultTheme: "dark" })
      );

      // Should load saved theme
      act(() => {
        // Wait for effect
      });

      expect(result.current.currentTheme).toBe("brand");

      // Get theme info
      const themeInfo = result.current.getThemeInfo("brand");
      expect(themeInfo?.name).toBe("Brand Theme");

      // Switch to default theme
      act(() => {
        result.current.setTheme("light");
      });

      expect(result.current.currentTheme).toBe("light");
      expect(localStorageMock.getItem("rve-extended-theme")).toBe("light");

      // Switch back to custom theme
      act(() => {
        result.current.setTheme("brand");
      });

      expect(result.current.currentTheme).toBe("brand");
    });

    it("should maintain state consistency across multiple operations", () => {
      const customThemes: CustomTheme[] = [
        { id: "theme1", name: "Theme 1", className: "theme-1" },
        { id: "theme2", name: "Theme 2", className: "theme-2" },
        { id: "theme3", name: "Theme 3", className: "theme-3" },
      ];

      const { result } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      const themes: ExtendedThemeMode[] = [
        "light",
        "dark",
        "theme1",
        "theme2",
        "theme3",
      ];

      themes.forEach((theme) => {
        act(() => {
          result.current.setTheme(theme);
        });

        expect(result.current.currentTheme).toBe(theme);
        expect(localStorageMock.getItem("rve-extended-theme")).toBe(theme);

        const themeInfo = result.current.getThemeInfo(theme);
        expect(themeInfo).toBeDefined();
      });
    });

    it("should persist theme across hook remounts", () => {
      const customThemes: CustomTheme[] = [
        { id: "persistent", name: "Persistent Theme" },
      ];

      const { unmount } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      // Set theme and unmount
      const { result: result1 } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        result1.current.setTheme("persistent");
      });

      unmount();

      // Remount and check if theme persists
      const { result: result2 } = renderHook(() =>
        useExtendedThemeSwitcher({ customThemes })
      );

      act(() => {
        // Wait for localStorage load
      });

      expect(result2.current.currentTheme).toBe("persistent");
    });
  });
});

