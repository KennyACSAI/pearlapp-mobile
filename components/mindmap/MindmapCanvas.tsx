// components/mindmap/MindmapCanvas.tsx
import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, Dimensions, Pressable, Text } from "react-native";
import Svg, { Circle, Line, G, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Plus, Minus } from "lucide-react-native";

import { Person, getInitials } from "@/data/sampleData";
import { colors, SvgColors, BorderRadius, Spacing, Shadows, Typography } from "@/constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MindmapCanvasProps {
  people: Person[];
  onPersonPress: (person: Person) => void;
}

const NODE_RADIUS = 36;
const ME_NODE_RADIUS = 50;
const INITIAL_SCALE = 1;
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;
const CANVAS_PADDING = 100;

// SVG-safe colors
const SVG_COLORS = {
  meNodeBackground: "rgb(0, 0, 0)",
  meNodeText: "rgb(255, 255, 255)",
  nodeBackground: "rgb(255, 255, 255)",
  nodeStroke: "rgba(0, 0, 0, 0.12)",
  lineStroke: "rgba(0, 0, 0, 0.08)",
  textPrimary: "rgb(0, 0, 0)",
  textSecondary: "rgba(0, 0, 0, 0.5)",
};

function clamp(v: number, min: number, max: number): number {
  "worklet";
  return Math.max(min, Math.min(max, v));
}

// Calculate tree layout positions
function calculateTreeLayout(people: Person[], canvasWidth: number, canvasHeight: number) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // "Me" node at center
  const meNode = {
    id: 'me',
    name: 'Me',
    x: centerX,
    y: centerY,
    isMe: true,
  };

  // Calculate positions for each person in a radial tree layout
  const nodePositions: Map<string, { x: number; y: number }> = new Map();
  
  // Group people by their connection depth (simplified - just one level for now)
  // In a real app, you'd do BFS from "Me" to determine levels
  const totalPeople = people.length;
  
  if (totalPeople === 0) {
    return { meNode, peopleNodes: [] };
  }

  // First ring - direct connections (all people for now)
  const firstRingRadius = 160;
  const secondRingRadius = 280;
  
  // Sort people by number of connections (more connected = closer to center)
  const sortedPeople = [...people].sort((a, b) => b.connections.length - a.connections.length);
  
  // Split into two rings if more than 6 people
  const firstRingPeople = sortedPeople.slice(0, Math.min(6, totalPeople));
  const secondRingPeople = sortedPeople.slice(6);

  // Position first ring
  firstRingPeople.forEach((person, index) => {
    const angle = (index / firstRingPeople.length) * 2 * Math.PI - Math.PI / 2;
    nodePositions.set(person.id, {
      x: centerX + Math.cos(angle) * firstRingRadius,
      y: centerY + Math.sin(angle) * firstRingRadius,
    });
  });

  // Position second ring
  secondRingPeople.forEach((person, index) => {
    const angle = (index / secondRingPeople.length) * 2 * Math.PI - Math.PI / 2 + Math.PI / secondRingPeople.length;
    nodePositions.set(person.id, {
      x: centerX + Math.cos(angle) * secondRingRadius,
      y: centerY + Math.sin(angle) * secondRingRadius,
    });
  });

  const peopleNodes = people.map(person => ({
    ...person,
    x: nodePositions.get(person.id)?.x || centerX,
    y: nodePositions.get(person.id)?.y || centerY,
  }));

  return { meNode, peopleNodes };
}

export function MindmapCanvas({ people, onPersonPress }: MindmapCanvasProps) {
  // Canvas dimensions
  const canvasWidth = SCREEN_WIDTH * 2;
  const canvasHeight = SCREEN_HEIGHT * 1.5;

  // Calculate layout
  const { meNode, peopleNodes } = useMemo(() => 
    calculateTreeLayout(people, canvasWidth, canvasHeight),
    [people, canvasWidth, canvasHeight]
  );

  // Gesture state
  const scale = useSharedValue(INITIAL_SCALE);
  const savedScale = useSharedValue(INITIAL_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Center the view initially
  const initialOffsetX = -(canvasWidth / 2 - SCREEN_WIDTH / 2);
  const initialOffsetY = -(canvasHeight / 2 - (SCREEN_HEIGHT - 200) / 2);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    });

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE);
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated styles
  const transformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + initialOffsetX },
      { translateY: translateY.value + initialOffsetY },
      { scale: scale.value },
    ],
  }));

  // Zoom controls
  const zoomIn = useCallback(() => {
    scale.value = withSpring(clamp(scale.value * 1.3, MIN_SCALE, MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    scale.value = withSpring(clamp(scale.value / 1.3, MIN_SCALE, MAX_SCALE));
  }, []);

  const resetView = useCallback(() => {
    scale.value = withSpring(INITIAL_SCALE);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  }, []);

  // Render connections (lines from Me to all, and between connected people)
  const connections = useMemo(() => {
    const lines: React.ReactElement[] = [];
    const drawn = new Set<string>();

    // Lines from Me to everyone
    peopleNodes.forEach((person) => {
      lines.push(
        <Line
          key={`me-${person.id}`}
          x1={meNode.x}
          y1={meNode.y}
          x2={person.x}
          y2={person.y}
          stroke={SVG_COLORS.lineStroke}
          strokeWidth={2}
          strokeLinecap="round"
        />
      );
    });

    // Lines between connected people
    peopleNodes.forEach((person) => {
      person.connections.forEach((connId) => {
        const key = [person.id, connId].sort().join("-");
        if (drawn.has(key)) return;
        drawn.add(key);

        const other = peopleNodes.find((p) => p.id === connId);
        if (!other) return;

        lines.push(
          <Line
            key={key}
            x1={person.x}
            y1={person.y}
            x2={other.x}
            y2={other.y}
            stroke={SVG_COLORS.lineStroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="4,4"
          />
        );
      });
    });

    return lines;
  }, [peopleNodes, meNode]);

  // Render people nodes
  const nodes = useMemo(() => {
    return peopleNodes.map((person) => {
      const initials = getInitials(person.name);
      const firstName = person.name.split(' ')[0];

      return (
        <G key={person.id}>
          {/* Node shadow */}
          <Circle
            cx={person.x + 2}
            cy={person.y + 3}
            r={NODE_RADIUS}
            fill="rgba(0, 0, 0, 0.08)"
          />
          {/* Node background */}
          <Circle
            cx={person.x}
            cy={person.y}
            r={NODE_RADIUS}
            fill={SVG_COLORS.nodeBackground}
            stroke={SVG_COLORS.nodeStroke}
            strokeWidth={2}
          />
          {/* Initials */}
          <SvgText
            x={person.x}
            y={person.y + 5}
            fill={SVG_COLORS.textSecondary}
            fontSize={16}
            fontWeight="600"
            textAnchor="middle"
          >
            {initials}
          </SvgText>
          {/* Name below node */}
          <SvgText
            x={person.x}
            y={person.y + NODE_RADIUS + 18}
            fill={SVG_COLORS.textPrimary}
            fontSize={12}
            fontWeight="600"
            textAnchor="middle"
          >
            {firstName}
          </SvgText>
          {/* Role */}
          <SvgText
            x={person.x}
            y={person.y + NODE_RADIUS + 32}
            fill={SVG_COLORS.textSecondary}
            fontSize={10}
            fontWeight="400"
            textAnchor="middle"
          >
            {person.role}
          </SvgText>
        </G>
      );
    });
  }, [peopleNodes]);

  // Render "Me" node
  const meNodeElement = useMemo(() => (
    <G>
      {/* Shadow */}
      <Circle
        cx={meNode.x + 3}
        cy={meNode.y + 4}
        r={ME_NODE_RADIUS}
        fill="rgba(0, 0, 0, 0.15)"
      />
      {/* Background */}
      <Circle
        cx={meNode.x}
        cy={meNode.y}
        r={ME_NODE_RADIUS}
        fill={SVG_COLORS.meNodeBackground}
      />
      {/* Text */}
      <SvgText
        x={meNode.x}
        y={meNode.y + 7}
        fill={SVG_COLORS.meNodeText}
        fontSize={22}
        fontWeight="700"
        textAnchor="middle"
      >
        Me
      </SvgText>
    </G>
  ), [meNode]);

  // Touch targets for people nodes
  const touchTargets = useMemo(() => {
    return peopleNodes.map((person) => ({
      id: person.id,
      person,
      x: person.x,
      y: person.y,
    }));
  }, [peopleNodes]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.canvasContainer}>
          <Animated.View style={[styles.transformLayer, transformStyle]}>
            <Svg width={canvasWidth} height={canvasHeight}>
              {connections}
              {nodes}
              {meNodeElement}
            </Svg>
          </Animated.View>

          {/* Touch layer */}
          <Animated.View
            style={[styles.touchLayer, transformStyle, { width: canvasWidth, height: canvasHeight }]}
            pointerEvents="box-none"
          >
            {touchTargets.map(({ id, person, x, y }) => (
              <Pressable
                key={id}
                onPress={() => onPersonPress(person)}
                style={[
                  styles.touchTarget,
                  {
                    left: x - NODE_RADIUS,
                    top: y - NODE_RADIUS,
                    width: NODE_RADIUS * 2,
                    height: NODE_RADIUS * 2,
                    borderRadius: NODE_RADIUS,
                  },
                ]}
              />
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <Pressable onPress={zoomIn} style={styles.zoomButton}>
          <Plus size={20} color={SvgColors.text} strokeWidth={2} />
        </Pressable>
        <Pressable onPress={zoomOut} style={styles.zoomButton}>
          <Minus size={20} color={SvgColors.text} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Reset view button */}
      <Pressable onPress={resetView} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </Pressable>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#000' }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderStyle: 'solid' }]} />
          <Text style={styles.legendText}>Direct</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderStyle: 'dashed' }]} />
          <Text style={styles.legendText}>Connected</Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  canvasContainer: {
    flex: 1,
    overflow: "hidden",
  },
  transformLayer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  touchLayer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  touchTarget: {
    position: "absolute",
  },
  zoomControls: {
    position: "absolute",
    bottom: 24,
    right: Spacing.md,
    gap: Spacing.xs,
  },
  zoomButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderOpacity?.[15] || 'rgba(0,0,0,0.15)',
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },
  resetButton: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderOpacity?.[15] || 'rgba(0,0,0,0.15)',
    ...Shadows.sm,
  },
  resetButtonText: {
    ...Typography.footnote,
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: colors.surfaceOpacity?.[80] || 'rgba(255,255,255,0.8)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLine: {
    width: 16,
    height: 0,
    borderTopWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  legendText: {
    ...Typography.caption,
    color: colors.textOpacity?.[60] || 'rgba(0,0,0,0.6)',
  },
});