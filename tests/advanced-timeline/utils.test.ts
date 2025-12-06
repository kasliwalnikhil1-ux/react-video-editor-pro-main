import {
  calculateViewportDuration,
  frameToTime,
  timeToFrame,
  calculateMousePosition,
  getTimelineContentStyles,
} from '../../app/reactvideoeditor/pro/components/advanced-timeline/utils';

describe('Timeline Utils', () => {
  describe('calculateViewportDuration', () => {
    it('should return content duration when zoom scale is 1', () => {
      expect(calculateViewportDuration(100, 1)).toBe(100);
    });

    it('should return content duration when zoom scale is greater than 1', () => {
      expect(calculateViewportDuration(100, 2)).toBe(100);
      expect(calculateViewportDuration(100, 5)).toBe(100);
    });

    it('should expand viewport when zoom scale is less than 1', () => {
      expect(calculateViewportDuration(100, 0.5)).toBe(200);
      expect(calculateViewportDuration(100, 0.25)).toBe(400);
    });

    it('should handle very small zoom scales without division by zero', () => {
      expect(calculateViewportDuration(100, 0.0001)).toBe(1000000);
    });

    it('should handle zero zoom scale by using minimum threshold', () => {
      expect(calculateViewportDuration(100, 0)).toBe(1000000); // Uses 0.0001 as minimum
    });

    it('should work with decimal content durations', () => {
      expect(calculateViewportDuration(50.5, 0.5)).toBe(101);
    });
  });

  describe('frameToTime', () => {
    it('should convert frames to time correctly', () => {
      expect(frameToTime(30, 30)).toBe(1); // 1 second at 30fps
      expect(frameToTime(60, 30)).toBe(2); // 2 seconds at 30fps
      expect(frameToTime(150, 30)).toBe(5); // 5 seconds at 30fps
    });

    it('should handle different frame rates', () => {
      expect(frameToTime(60, 60)).toBe(1); // 1 second at 60fps
      expect(frameToTime(24, 24)).toBe(1); // 1 second at 24fps
    });

    it('should handle zero frames', () => {
      expect(frameToTime(0, 30)).toBe(0);
    });

    it('should handle negative frames', () => {
      expect(frameToTime(-30, 30)).toBe(-1);
    });

    it('should handle decimal frames', () => {
      expect(frameToTime(45.5, 30)).toBeCloseTo(1.517, 3);
    });

    it('should handle zero fps', () => {
      expect(frameToTime(30, 0)).toBe(Infinity);
    });
  });

  describe('timeToFrame', () => {
    it('should convert time to frames correctly', () => {
      expect(timeToFrame(1, 30)).toBe(30); // 1 second at 30fps
      expect(timeToFrame(2, 30)).toBe(60); // 2 seconds at 30fps
      expect(timeToFrame(5, 30)).toBe(150); // 5 seconds at 30fps
    });

    it('should handle different frame rates', () => {
      expect(timeToFrame(1, 60)).toBe(60); // 1 second at 60fps
      expect(timeToFrame(1, 24)).toBe(24); // 1 second at 24fps
    });

    it('should round to nearest frame', () => {
      expect(timeToFrame(1.517, 30)).toBe(46); // Rounds 45.51 to 46
      expect(timeToFrame(0.033, 30)).toBe(1); // Rounds 0.99 to 1
    });

    it('should handle zero time', () => {
      expect(timeToFrame(0, 30)).toBe(0);
    });

    it('should handle negative time', () => {
      expect(timeToFrame(-1, 30)).toBe(-30);
    });

    it('should handle zero fps', () => {
      expect(timeToFrame(1, 0)).toBe(0);
    });
  });

  describe('calculateMousePosition', () => {
    const mockRect: DOMRect = {
      left: 100,
      top: 50,
      width: 800,
      height: 200,
      right: 900,
      bottom: 250,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    };

    it('should calculate position as percentage within bounds', () => {
      expect(calculateMousePosition(500, mockRect)).toBe(50); // Middle of timeline
      expect(calculateMousePosition(300, mockRect)).toBe(25); // Quarter way
      expect(calculateMousePosition(700, mockRect)).toBe(75); // Three quarters
    });

    it('should clamp position to 0% minimum', () => {
      expect(calculateMousePosition(50, mockRect)).toBe(0); // Before timeline start
      expect(calculateMousePosition(-100, mockRect)).toBe(0); // Far before timeline
    });

    it('should clamp position to 100% maximum', () => {
      expect(calculateMousePosition(950, mockRect)).toBe(100); // After timeline end
      expect(calculateMousePosition(1200, mockRect)).toBe(100); // Far after timeline
    });

    it('should handle edge positions', () => {
      expect(calculateMousePosition(100, mockRect)).toBe(0); // Exactly at left edge
      expect(calculateMousePosition(900, mockRect)).toBe(100); // Exactly at right edge
    });

    it('should work with different timeline sizes', () => {
      const smallRect: DOMRect = {
        ...mockRect,
        left: 0,
        width: 400,
        right: 400,
      };

      expect(calculateMousePosition(200, smallRect)).toBe(50); // Middle of smaller timeline
      expect(calculateMousePosition(100, smallRect)).toBe(25); // Quarter way
    });
  });

  describe('getTimelineContentStyles', () => {
    it('should return 100% width for zoom scale 1', () => {
      const styles = getTimelineContentStyles(1);
      expect(styles.width).toBe('100%');
      expect(styles.minWidth).toBe('100%');
    });

    it('should expand width for zoom scale greater than 1', () => {
      const styles = getTimelineContentStyles(2);
      expect(styles.width).toBe('200%');
      expect(styles.minWidth).toBe('100%');
    });

    it('should maintain minimum 100% width for zoom scale less than 1', () => {
      const styles = getTimelineContentStyles(0.5);
      expect(styles.width).toBe('100%'); // Math.max(100, 100 * 0.5) = 100
      expect(styles.minWidth).toBe('100%');
    });

    it('should include performance optimization properties', () => {
      const styles = getTimelineContentStyles(1.5);
      expect(styles.willChange).toBe('width, transform');
      expect(styles.transform).toBe('translateZ(0)');
    });

    it('should handle very large zoom scales', () => {
      const styles = getTimelineContentStyles(10);
      expect(styles.width).toBe('1000%');
    });

    it('should handle zero zoom scale', () => {
      const styles = getTimelineContentStyles(0);
      expect(styles.width).toBe('100%'); // Math.max(100, 100 * 0) = 100
    });

    it('should handle negative zoom scale', () => {
      const styles = getTimelineContentStyles(-1);
      expect(styles.width).toBe('100%'); // Math.max(100, 100 * -1) = 100
    });
  });

  describe('Integration tests', () => {
    it('should convert frame to time and back consistently', () => {
      const originalFrame = 150;
      const fps = 30;
      
      const time = frameToTime(originalFrame, fps);
      const backToFrame = timeToFrame(time, fps);
      
      expect(backToFrame).toBe(originalFrame);
    });

    it('should handle fractional time conversions', () => {
      const time = 1.5; // 1.5 seconds
      const fps = 30;
      
      const frame = timeToFrame(time, fps);
      const backToTime = frameToTime(frame, fps);
      
      expect(backToTime).toBeCloseTo(time, 2);
    });

    it('should work with mouse position and viewport calculations', () => {
      const mockRect: DOMRect = {
        left: 0,
        top: 0,
        width: 1000,
        height: 200,
        right: 1000,
        bottom: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };

      const mouseX = 500; // Middle of timeline
      const position = calculateMousePosition(mouseX, mockRect);
      expect(position).toBe(50);

      // This position could be used to calculate time in timeline
      const totalDuration = 100; // 100 seconds
      const timeAtPosition = (position / 100) * totalDuration;
      expect(timeAtPosition).toBe(50); // 50 seconds
    });
  });
}); 