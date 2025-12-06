import React from "react";
import { CaptionOverlay } from "../../../types";
import { captionTemplates } from "../../../templates/caption-templates";

/**
 * Props for the CaptionStylePanel component
 * @interface CaptionStylePanelProps
 * @property {CaptionOverlay} localOverlay - Current caption overlay being styled
 * @property {Function} setLocalOverlay - Function to update the caption overlay
 */
interface CaptionStylePanelProps {
  localOverlay: CaptionOverlay;
  setLocalOverlay: (overlay: CaptionOverlay) => void;
}

/**
 * CaptionStylePanel Component
 *
 * @component
 * @description
 * Provides a visual interface for selecting and customizing caption styles.
 * Features include:
 * - Pre-defined style templates
 * - Live preview of styles
 * - Color palette visualization
 * - Active state indication
 *
 * Each template includes:
 * - Preview text with highlight example
 * - Template name and status
 * - Color scheme visualization
 *
 * @example
 * ```tsx
 * <CaptionStylePanel
 *   localOverlay={captionOverlay}
 *   setLocalOverlay={handleStyleUpdate}
 * />
 * ```
 */
export const CaptionStylePanel: React.FC<CaptionStylePanelProps> = ({
  localOverlay,
  setLocalOverlay,
}) => {
  return (
    <div className="space-y-4">
      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(captionTemplates).map(([templateId, template]) => (
          <button
            key={templateId}
            onClick={() => {
              const updatedOverlay = {
                ...localOverlay,
                template: templateId,
                styles: template.styles,
              };
              setLocalOverlay(updatedOverlay);
            }}
            className={
              `group relative overflow-hidden rounded-lg transition-all duration-200
              ${
                localOverlay?.template === templateId
                  ? " bg-primary/10 border-2 border-primary"
                  : "border-border hover:border-accent bg-muted/50 hover:bg-muted/80"
              }`
            }
          >
            {/* Preview Area with demo text */}
            <div className="relative aspect-16/7 w-full overflow-hidden bg-card">
              <div className="absolute inset-0 flex items-center justify-center p-10">
                <span
                  style={{
                    ...template.styles,
                    fontSize: "1.2rem",
                    lineHeight: "1.2",
                  }}
                >
                  Let&apos;s{" "}
                  <span
                    style={{
                      ...template.styles.highlightStyle,
                      transform: `scale(${
                        template.styles.highlightStyle?.scale || 1
                      })`,
                    }}
                  >
                    start
                  </span>{" "}
                  with a demo of your caption.
                </span>
              </div>
            </div>

            {/* Template Info and Color Palette */}
            <div className="flex items-center justify-between p-3 bg-card/50 backdrop-blur-sm">
              {/* Template Name and Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-extralight text-primary-foreground">
                  {template.name}
                </span>
                {localOverlay?.template === templateId && (
                  <span className="text-[10px] text-primary font-extralight bg-primary/10 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              {/* Color Palette Preview */}
              <div className="flex items-center gap-1.5">
                {[
                  template.styles.color,
                  template.styles.highlightStyle?.backgroundColor,
                ].map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border-[0.1px] border-popover-foreground/30"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
