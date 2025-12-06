import {
  findGapsInTrack,
  closeGapsInTrack,
  calculateMagneticDropPosition,
  calculateMagneticInsertionPreview,
  pushItemsDuringResize,
  calculatePushingResizePreview,
  canFitAtPosition,
  findBestPositionForNewItem,
  createNewItemWithIntelligentPositioning,
} from '../../../app/reactvideoeditor/pro/components/advanced-timeline/utils/gap-utils';
import { TimelineItem } from '../../../app/reactvideoeditor/pro/components/advanced-timeline/types';

// Helper to create mock timeline items
const createMockItem = (
  id: string,
  start: number,
  end: number,
  trackId: string = 'track-1',
  type: string = 'video'
): TimelineItem => ({
  id,
  trackId,
  start,
  end,
  type,
  label: `Item ${id}`,
  color: '#6b7280',
});

describe('gap-utils', () => {
  describe('findGapsInTrack', () => {
    it('should return empty array for empty track', () => {
      const gaps = findGapsInTrack([]);
      expect(gaps).toEqual([]);
    });

    it('should find gap at the beginning', () => {
      const items = [createMockItem('1', 2, 5, 'track-1')];
      const gaps = findGapsInTrack(items);
      
      expect(gaps).toEqual([{ start: 0, end: 2 }]);
    });

    it('should not find gap when track starts at 0', () => {
      const items = [createMockItem('1', 0, 5, 'track-1')];
      const gaps = findGapsInTrack(items);
      
      expect(gaps).toEqual([]);
    });

    it('should find gaps between items', () => {
      const items = [
        createMockItem('1', 2, 3, 'track-1'),
        createMockItem('2', 5, 8, 'track-1'),
        createMockItem('3', 10, 12, 'track-1'),
      ];
      const gaps = findGapsInTrack(items);
      
      expect(gaps).toEqual([
        { start: 0, end: 2 },
        { start: 3, end: 5 },
        { start: 8, end: 10 },
      ]);
    });

    it('should not find gaps when items are adjacent', () => {
      const items = [
        createMockItem('1', 0, 3, 'track-1'),
        createMockItem('2', 3, 6, 'track-1'),
        createMockItem('3', 6, 9, 'track-1'),
      ];
      const gaps = findGapsInTrack(items);
      
      expect(gaps).toEqual([]);
    });

    it('should handle unsorted items', () => {
      const items = [
        createMockItem('2', 5, 8, 'track-1'),
        createMockItem('1', 2, 3, 'track-1'),
        createMockItem('3', 10, 12, 'track-1'),
      ];
      const gaps = findGapsInTrack(items);
      
      expect(gaps).toEqual([
        { start: 0, end: 2 },
        { start: 3, end: 5 },
        { start: 8, end: 10 },
      ]);
    });

    it('should not include gap at the end', () => {
      const items = [
        createMockItem('1', 0, 3, 'track-1'),
        createMockItem('2', 5, 8, 'track-1'),
      ];
      const gaps = findGapsInTrack(items);
      
      // Should not include gap from 8 to infinity
      expect(gaps).toEqual([{ start: 3, end: 5 }]);
    });

    it('should handle overlapping items', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 3, 8, 'track-1'), // overlaps with item 1
      ];
      const gaps = findGapsInTrack(items);
      
      // No gaps between overlapping items
      expect(gaps).toEqual([]);
    });
  });

  describe('closeGapsInTrack', () => {
    it('should return empty array for empty track', () => {
      const closed = closeGapsInTrack([]);
      expect(closed).toEqual([]);
    });

    it('should move single item to start at 0', () => {
      const items = [createMockItem('1', 5, 8, 'track-1')];
      const closed = closeGapsInTrack(items);
      
      expect(closed).toHaveLength(1);
      expect(closed[0].start).toBe(0);
      expect(closed[0].end).toBe(3); // Duration preserved (8-5 = 3)
    });

    it('should close gaps between multiple items', () => {
      const items = [
        createMockItem('1', 2, 5, 'track-1'), // duration 3
        createMockItem('2', 10, 15, 'track-1'), // duration 5
        createMockItem('3', 20, 22, 'track-1'), // duration 2
      ];
      const closed = closeGapsInTrack(items);
      
      expect(closed).toHaveLength(3);
      expect(closed[0]).toMatchObject({ id: '1', start: 0, end: 3 });
      expect(closed[1]).toMatchObject({ id: '2', start: 3, end: 8 });
      expect(closed[2]).toMatchObject({ id: '3', start: 8, end: 10 });
    });

    it('should preserve item duration when closing gaps', () => {
      const items = [
        createMockItem('1', 5, 10, 'track-1'), // duration 5
        createMockItem('2', 20, 23, 'track-1'), // duration 3
      ];
      const closed = closeGapsInTrack(items);
      
      expect(closed[0].end - closed[0].start).toBe(5);
      expect(closed[1].end - closed[1].start).toBe(3);
    });

    it('should handle unsorted items', () => {
      const items = [
        createMockItem('2', 10, 15, 'track-1'),
        createMockItem('1', 2, 5, 'track-1'),
        createMockItem('3', 20, 22, 'track-1'),
      ];
      const closed = closeGapsInTrack(items);
      
      expect(closed[0].id).toBe('1');
      expect(closed[1].id).toBe('2');
      expect(closed[2].id).toBe('3');
    });

    it('should not affect items that are already adjacent', () => {
      const items = [
        createMockItem('1', 0, 3, 'track-1'),
        createMockItem('2', 3, 6, 'track-1'),
        createMockItem('3', 6, 9, 'track-1'),
      ];
      const closed = closeGapsInTrack(items);
      
      expect(closed).toEqual(items);
    });
  });

  describe('calculateMagneticDropPosition', () => {
    it('should return 0 for empty track', () => {
      const position = calculateMagneticDropPosition([]);
      expect(position).toBe(0);
    });

    it('should return end of last item', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 5, 10, 'track-1'),
      ];
      const position = calculateMagneticDropPosition(items);
      
      expect(position).toBe(10);
    });

    it('should handle unsorted items', () => {
      const items = [
        createMockItem('2', 5, 10, 'track-1'),
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('3', 10, 15, 'track-1'),
      ];
      const position = calculateMagneticDropPosition(items);
      
      expect(position).toBe(15); // End of item 3
    });

    it('should return end of latest item even with gaps', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 10, 15, 'track-1'),
      ];
      const position = calculateMagneticDropPosition(items);
      
      expect(position).toBe(15);
    });
  });

  describe('calculateMagneticInsertionPreview', () => {
    it('should return insertion at 0 for empty track', () => {
      const result = calculateMagneticInsertionPreview([], 5, 0);
      
      expect(result.insertionIndex).toBe(0);
      expect(result.insertionStart).toBe(0);
      expect(result.previewItems).toEqual([]);
    });

    it('should insert at beginning if intended start is before first item midpoint', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'), // magnetic: 0-5
        createMockItem('2', 5, 10, 'track-1'), // magnetic: 5-10
      ];
      const result = calculateMagneticInsertionPreview(items, 3, 1); // intend to drop at 1
      
      expect(result.insertionIndex).toBe(0);
      expect(result.insertionStart).toBe(0);
      expect(result.previewItems).toHaveLength(2);
      // First item should be pushed to start after the new item (duration 3)
      expect(result.previewItems[0]).toMatchObject({ id: '1', start: 3, end: 8 });
      expect(result.previewItems[1]).toMatchObject({ id: '2', start: 8, end: 13 });
    });

    it('should insert at end if intended start is after last item midpoint', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 5, 10, 'track-1'),
      ];
      const result = calculateMagneticInsertionPreview(items, 3, 20);
      
      expect(result.insertionIndex).toBe(2);
      expect(result.insertionStart).toBe(10); // After both items
      expect(result.previewItems).toHaveLength(2);
      expect(result.previewItems[0]).toMatchObject({ id: '1', start: 0, end: 5 });
      expect(result.previewItems[1]).toMatchObject({ id: '2', start: 5, end: 10 });
    });

    it('should insert in middle based on magnetic midpoint', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'), // magnetic: 0-5, midpoint: 2.5
        createMockItem('2', 5, 10, 'track-1'), // magnetic: 5-10, midpoint: 7.5
      ];
      const result = calculateMagneticInsertionPreview(items, 2, 6); // Drop at 6 (between midpoints)
      
      expect(result.insertionIndex).toBe(1);
      expect(result.insertionStart).toBe(5);
      expect(result.previewItems).toHaveLength(2);
      expect(result.previewItems[0]).toMatchObject({ id: '1', start: 0, end: 5 });
      expect(result.previewItems[1]).toMatchObject({ id: '2', start: 7, end: 12 }); // Pushed by new item (duration 2)
    });

    it('should handle gaps in items correctly', () => {
      const items = [
        createMockItem('1', 0, 3, 'track-1'), // Gap from 3-10
        createMockItem('2', 10, 15, 'track-1'),
      ];
      const result = calculateMagneticInsertionPreview(items, 2, 2);
      
      expect(result.insertionIndex).toBe(1);
      expect(result.insertionStart).toBe(3);
      expect(result.previewItems[0]).toMatchObject({ id: '1', start: 0, end: 3 });
      expect(result.previewItems[1]).toMatchObject({ id: '2', start: 5, end: 10 });
    });
  });

  describe('pushItemsDuringResize', () => {
    it('should return empty array for empty track', () => {
      const result = pushItemsDuringResize([], 'item-1', 0, 5);
      
      expect(result.items).toEqual([]);
      expect(result.actualStart).toBe(0);
      expect(result.actualEnd).toBe(5);
    });

    it('should return unchanged if item not found', () => {
      const items = [createMockItem('1', 0, 5, 'track-1')];
      const result = pushItemsDuringResize(items, 'nonexistent', 0, 10);
      
      expect(result.items).toEqual(items);
    });

    it('should push items when expanding to the right', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 5, 10, 'track-1'),
        createMockItem('3', 10, 15, 'track-1'),
      ];
      const result = pushItemsDuringResize(items, '1', 0, 8); // Expand item 1 from 5 to 8
      
      const item1 = result.items.find(item => item.id === '1');
      const item2 = result.items.find(item => item.id === '2');
      const item3 = result.items.find(item => item.id === '3');
      
      expect(item1).toMatchObject({ start: 0, end: 8 });
      expect(item2).toMatchObject({ start: 8, end: 13 }); // Pushed by 3
      expect(item3).toMatchObject({ start: 13, end: 18 }); // Cascaded push
    });

    it('should stop at boundary when expanding to the left', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 5, 10, 'track-1'),
        createMockItem('3', 10, 15, 'track-1'),
      ];
      const result = pushItemsDuringResize(items, '2', 2, 10); // Try to expand item 2 left to 2
      
      const item2 = result.items.find(item => item.id === '2');
      
      expect(item2?.start).toBe(5); // Stopped at boundary of item 1
      expect(item2?.end).toBe(10);
      expect(result.actualStart).toBe(5);
    });

    it('should allow left expansion when no blocking items', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 10, 15, 'track-1'),
      ];
      const result = pushItemsDuringResize(items, '2', 7, 15); // Expand item 2 left to 7
      
      const item2 = result.items.find(item => item.id === '2');
      
      expect(item2).toMatchObject({ start: 7, end: 15 });
      expect(result.actualStart).toBe(7);
    });

    it('should handle expanding both directions', () => {
      const items = [
        createMockItem('1', 0, 3, 'track-1'),
        createMockItem('2', 5, 10, 'track-1'),
        createMockItem('3', 10, 15, 'track-1'),
      ];
      const result = pushItemsDuringResize(items, '2', 4, 12); // Expand both ways
      
      const item2 = result.items.find(item => item.id === '2');
      const item3 = result.items.find(item => item.id === '3');
      
      expect(item2).toMatchObject({ start: 4, end: 12 });
      expect(item3).toMatchObject({ start: 12, end: 17 }); // Pushed
    });

    it('should update mediaStart when resizing video from the left', () => {
      const items = [
        createMockItem('1', 0, 10, 'track-1', 'video'),
      ];
      items[0].mediaStart = 5; // Starting at 5 seconds in the source
      
      const result = pushItemsDuringResize(items, '1', 2, 10); // Move start from 0 to 2
      
      const item1 = result.items.find(item => item.id === '1');
      
      expect(item1?.mediaStart).toBe(7); // 5 + 2 (delta)
      expect(item1?.start).toBe(2);
    });

    it('should clamp resize to mediaSrcDuration for video items', () => {
      const items = [createMockItem('1', 0, 5, 'track-1', 'video')];
      items[0].mediaStart = 0;
      items[0].mediaSrcDuration = 10; // Source is 10 seconds long
      
      const result = pushItemsDuringResize(items, '1', 0, 15); // Try to expand to 15 seconds
      
      const item1 = result.items.find(item => item.id === '1');
      
      expect(item1?.end).toBe(10); // Clamped to mediaSrcDuration
      expect(result.actualEnd).toBe(10);
    });

    it('should respect mediaStart offset when clamping duration', () => {
      const items = [createMockItem('1', 0, 5, 'track-1', 'video')];
      items[0].mediaStart = 3; // Starting 3 seconds into the source
      items[0].mediaSrcDuration = 10; // Source is 10 seconds long
      
      const result = pushItemsDuringResize(items, '1', 0, 10); // Try to expand to 10 seconds
      
      const item1 = result.items.find(item => item.id === '1');
      
      // Can only go from mediaStart(3) to end(10) = 7 seconds max
      expect(item1?.end).toBe(7);
      expect(result.actualEnd).toBe(7);
    });
  });

  describe('calculatePushingResizePreview', () => {
    it('should return preview matching pushItemsDuringResize', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 5, 10, 'track-1'),
      ];
      const preview = calculatePushingResizePreview(items, '1', 0, 8);
      
      expect(preview).toHaveLength(2);
      expect(preview[0]).toMatchObject({ id: '1', start: 0, end: 8, duration: 8 });
      expect(preview[1]).toMatchObject({ id: '2', start: 8, end: 13, duration: 5 });
    });
  });

  describe('canFitAtPosition', () => {
    it('should return true for empty track', () => {
      const canFit = canFitAtPosition([], 0, 5);
      expect(canFit).toBe(true);
    });

    it('should return true when no overlap', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 10, 15, 'track-1'),
      ];
      const canFit = canFitAtPosition(items, 5, 5); // 5 to 10
      
      expect(canFit).toBe(true);
    });

    it('should return false when overlapping existing item', () => {
      const items = [
        createMockItem('1', 0, 5, 'track-1'),
        createMockItem('2', 10, 15, 'track-1'),
      ];
      const canFit = canFitAtPosition(items, 3, 5); // 3 to 8, overlaps item 1
      
      expect(canFit).toBe(false);
    });

    it('should return false when completely containing existing item', () => {
      const items = [createMockItem('1', 5, 10, 'track-1')];
      const canFit = canFitAtPosition(items, 0, 20); // 0 to 20, contains item 1
      
      expect(canFit).toBe(false);
    });

    it('should return true when adjacent but not overlapping', () => {
      const items = [createMockItem('1', 0, 5, 'track-1')];
      const canFit = canFitAtPosition(items, 5, 5); // 5 to 10
      
      expect(canFit).toBe(true);
    });
  });

  describe('findBestPositionForNewItem', () => {
    it('should throw error when no tracks available', () => {
      expect(() => {
        findBestPositionForNewItem([], 5);
      }).toThrow('No tracks available for item placement');
    });

    it('should use preferred track and start time when available', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
        { id: 'track-2', items: [], magnetic: false },
      ];
      const result = findBestPositionForNewItem(tracks, 5, undefined, 'track-2', 10);
      
      expect(result).toEqual({ trackId: 'track-2', startTime: 10 });
    });

    it('should fallback to finding gap in preferred track if position overlaps', () => {
      const tracks = [
        { 
          id: 'track-1', 
          items: [createMockItem('1', 5, 15, 'track-1')],
          magnetic: false 
        },
        { id: 'track-2', items: [], magnetic: false },
      ];
      const result = findBestPositionForNewItem(tracks, 5, undefined, 'track-1', 10);
      
      // Should find a gap in track-1 (at position 0) instead of the overlapping preferred position
      expect(result.trackId).toBe('track-1');
      expect(result.startTime).toBe(0); // Gap from 0 to 5
    });

    it('should place at current playhead time when available', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
      ];
      const result = findBestPositionForNewItem(tracks, 5, 10);
      
      expect(result).toEqual({ trackId: 'track-1', startTime: 10 });
    });

    it('should find first available gap that fits', () => {
      const tracks = [
        {
          id: 'track-1',
          items: [
            createMockItem('1', 0, 3, 'track-1'),
            createMockItem('2', 5, 10, 'track-1'),
          ],
          magnetic: false,
        },
      ];
      const result = findBestPositionForNewItem(tracks, 1.5); // Duration 1.5
      
      expect(result).toEqual({ trackId: 'track-1', startTime: 3 }); // Gap from 3 to 5
    });

    it('should not use gap that is too small', () => {
      const tracks = [
        {
          id: 'track-1',
          items: [
            createMockItem('1', 0, 3, 'track-1'),
            createMockItem('2', 4, 10, 'track-1'), // Gap of 1 second
          ],
          magnetic: false,
        },
      ];
      const result = findBestPositionForNewItem(tracks, 2); // Duration 2, won't fit in gap
      
      expect(result).toEqual({ trackId: 'track-1', startTime: 10 }); // End of track
    });

    it('should place at end of least populated track', () => {
      const tracks = [
        {
          id: 'track-1',
          items: [createMockItem('1', 0, 10, 'track-1')],
          magnetic: false,
        },
        {
          id: 'track-2',
          items: [createMockItem('2', 0, 5, 'track-2')],
          magnetic: false,
        },
      ];
      const result = findBestPositionForNewItem(tracks, 3);
      
      expect(result).toEqual({ trackId: 'track-2', startTime: 5 }); // Track 2 ends earlier
    });

    it('should place at 0 in empty track', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
      ];
      const result = findBestPositionForNewItem(tracks, 5);
      
      expect(result).toEqual({ trackId: 'track-1', startTime: 0 });
    });
  });

  describe('createNewItemWithIntelligentPositioning', () => {
    it('should create item with intelligent positioning', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
      ];
      const result = createNewItemWithIntelligentPositioning(
        tracks,
        { type: 'video', label: 'My Video', duration: 5 }
      );
      
      expect(result).toMatchObject({
        trackId: 'track-1',
        start: 0,
        end: 5,
        label: 'My Video',
        type: 'video',
      });
    });

    it('should use default duration when not provided', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
      ];
      const result = createNewItemWithIntelligentPositioning(
        tracks,
        { type: 'text' }
      );
      
      expect(result.end - result.start).toBe(3); // Default duration
    });

    it('should use default label when not provided', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
      ];
      const result = createNewItemWithIntelligentPositioning(
        tracks,
        { type: 'image', duration: 5 }
      );
      
      expect(result.label).toBe('New image');
    });

    it('should pass through custom data', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
      ];
      const customData = { url: 'https://example.com/video.mp4' };
      const result = createNewItemWithIntelligentPositioning(
        tracks,
        { type: 'video', duration: 5, data: customData }
      );
      
      expect(result.data).toEqual(customData);
    });

    it('should use preferred track and start time', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
        { id: 'track-2', items: [], magnetic: false },
      ];
      const result = createNewItemWithIntelligentPositioning(
        tracks,
        {
          type: 'audio',
          duration: 5,
          preferredTrackId: 'track-2',
          preferredStartTime: 10,
        }
      );
      
      expect(result).toMatchObject({
        trackId: 'track-2',
        start: 10,
        end: 15,
      });
    });

    it('should use current time when provided', () => {
      const tracks = [
        { id: 'track-1', items: [], magnetic: false },
      ];
      const result = createNewItemWithIntelligentPositioning(
        tracks,
        { type: 'text', duration: 3 },
        15 // currentTime
      );
      
      expect(result).toMatchObject({
        trackId: 'track-1',
        start: 15,
        end: 18,
      });
    });

    it('should fallback to finding gap when preferred position overlaps', () => {
      const tracks = [
        {
          id: 'track-1',
          items: [createMockItem('1', 10, 20, 'track-1')],
          magnetic: false,
        },
        { id: 'track-2', items: [], magnetic: false },
      ];
      const result = createNewItemWithIntelligentPositioning(
        tracks,
        {
          type: 'video',
          duration: 5,
          preferredTrackId: 'track-1',
          preferredStartTime: 12, // Overlaps with existing item
        }
      );
      
      // Should find gap at the beginning of track-1 instead
      expect(result.trackId).toBe('track-1');
      expect(result.start).toBe(0); // Gap from 0 to 10
      expect(result.end).toBe(5);
    });
  });
});

