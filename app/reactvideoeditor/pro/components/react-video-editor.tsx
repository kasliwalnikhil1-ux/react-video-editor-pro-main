import React, { useState, useEffect, useRef } from "react";

import { DefaultSidebar } from "./shared/default-sidebar";
import { SidebarInset } from "./ui/sidebar";
import { Editor } from "./core/editor";
import { VideoPlayer } from "./core/video-player";
import { AutosaveStatus } from "./autosave/autosave-status";
import { OverlayType } from "../types";
import { CustomTheme } from "../hooks/use-extended-theme-switcher";
import { ReactVideoEditorProvider, ReactVideoEditorProviderProps } from "./providers/react-video-editor-provider";
import { PlayerRef } from "@remotion/player";

export interface ReactVideoEditorProps extends Omit<ReactVideoEditorProviderProps, 'children'> {
  showSidebar?: boolean;
  showAutosaveStatus?: boolean;
  className?: string;
  customSidebar?: React.ReactNode;
  /** Custom logo element for the default sidebar header */
  sidebarLogo?: React.ReactNode;
  /** Footer text for the default sidebar (ignored if customSidebar is provided) */
  sidebarFooterText?: string;
  /** Array of overlay types to disable/hide from the sidebar (ignored if customSidebar is provided) */
  disabledPanels?: OverlayType[];
  /** Whether to show icon titles in the sidebar (ignored if customSidebar is provided) */
  showIconTitles?: boolean;
  /** Array of available custom themes for the theme dropdown */
  availableThemes?: CustomTheme[] | undefined;
  /** Current selected theme */
  selectedTheme?: string | undefined;
  /** Callback when theme is changed */
  onThemeChange?: ((themeId: string) => void) | undefined;
  /** Whether to show the default light/dark themes */
  showDefaultThemes?: boolean | undefined;
  /** Whether to hide the theme toggle dropdown */
  hideThemeToggle?: boolean | undefined;
  /** Default theme to use when theme toggle is hidden */
  defaultTheme?: string | undefined;
  /** Whether to render in player-only mode (no editor UI) */
  isPlayerOnly?: boolean;
  /** Whether the project from URL is still loading */
  isLoadingProject?: boolean;
}

export const ReactVideoEditor: React.FC<ReactVideoEditorProps> = ({
  showSidebar = true,
  showAutosaveStatus = true,
  className,
  customSidebar,
  sidebarLogo,
  sidebarFooterText,
  disabledPanels,
  showIconTitles = true,
  availableThemes = [],
  selectedTheme,
  onThemeChange,
  showDefaultThemes = true,
  hideThemeToggle = false,
  defaultTheme = 'dark',
  onSaving,
  onSaved,
  isPlayerOnly = false,
  ...providerProps
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const playerRef = useRef<PlayerRef>(null);

  const handleSaving = (saving: boolean) => {
    setIsSaving(saving);
    onSaving?.(saving);
  };

  const handleSaved = (timestamp: number) => {
    setLastSaveTime(timestamp);
    onSaved?.(timestamp);
  };

  // Set up mobile viewport height handling for player-only mode
  useEffect(() => {
    if (!isPlayerOnly) return;
    
    const handleResize = () => {
      // Set CSS custom property for viewport height to use instead of h-screen
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Initial call
    handleResize();

    // Handle orientation changes and resizes
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 100); // Small delay for mobile browsers
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [isPlayerOnly]);

  return (
    <ReactVideoEditorProvider
      {...providerProps}
      onSaving={handleSaving}
      onSaved={handleSaved}
      playerRef={playerRef}
    >
      {isPlayerOnly ? (
        // Player-only mode: Simple fullscreen video player
        <div 
          className="w-full bg-black flex items-center justify-center"
          style={{
            height: "calc(var(--vh, 1vh) * 100)",
            maxHeight: "-webkit-fill-available" /* Safari fix */,
          }}
        >
          <VideoPlayer playerRef={playerRef} isPlayerOnly={true} />
        </div>
      ) : (
        // Editor mode: Full editor interface with sidebar
        <>
          {showSidebar && (customSidebar || <DefaultSidebar logo={sidebarLogo} footerText={sidebarFooterText || "RVE"} disabledPanels={disabledPanels || []} showIconTitles={showIconTitles} />)}
          <SidebarInset className={className}>
            <Editor 
              availableThemes={availableThemes}
              selectedTheme={selectedTheme}
              onThemeChange={onThemeChange}
              showDefaultThemes={showDefaultThemes}
              hideThemeToggle={hideThemeToggle}
              defaultTheme={defaultTheme}
            />
          </SidebarInset>

          {showAutosaveStatus && (
            <AutosaveStatus
              isSaving={isSaving}
              lastSaveTime={lastSaveTime}
            />
          )}
        </>
      )}
    </ReactVideoEditorProvider>
  );
}; 