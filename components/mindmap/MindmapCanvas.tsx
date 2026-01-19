// pearlapp-mobile1/components/mindmap/MindmapCanvas.tsx
import React, { useMemo, useEffect, useCallback } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import Svg, { Circle, Line, G, Text as SvgText } from "react-native-svg";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Plus, Minus } from "lucide-react-native";

import { Person, getInitials } from "@/data/sampleData";
import { colors, SvgColors, BorderRadius, Spacing, Shadows } from "@/constants";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MindmapCanvasProps {
  people: Person[];
  onPersonPress: (person: Person) => void;
}

const NODE_RADIUS = 40;
const INITIAL_SCALE = 1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const CANVAS_HEIGHT_OFFSET = 200;

// SVG-safe colors
const SVG_COLORS = {
  nodeBackground: "rgba(255, 255, 255, 0.9)",
  nodeStroke: "rgba(0, 0, 0, 0.15)",
  lineStroke: "rgba(0, 0, 0, 0.12)",
  textPrimary: "rgba(0, 0, 0, 1)",
  textSecondary: "rgba(0, 0, 0, 0.45)",
};

function clamp(v: number, min: number, max: number): number {
  "worklet";
  return Math.max(min, Math.min(max, v));
}

export function MindmapCanvas({ people, onPersonPress }: MindmapCanvasProps) {
  console.log("[MindmapCanvas] Rendering with", people.length, "people");

  // Center nodes on first render
  const initialOffset = useMemo(() => {
    const xs = people.filter((p) => typeof p.x === "number").map((p) => p.x as number);
    const ys = people.filter((p) => typeof p.y === "number").map((p) => p.y as number);

    if (xs.length === 0 || ys.length === 0) return { x: 0, y: 0 };

    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    return {
      x: SCREEN_WIDTH / 2 - centerX,
      y: (SCREEN_HEIGHT - CANVAS_HEIGHT_OFFSET) / 2 - centerY,
    };
  }, [people]);

  // Shared values for gestures
  const scale = useSharedValue(INITIAL_SCALE);
  const tx = useSharedValue(initialOffset.x);
  const ty = useSharedValue(initialOffset.y);
  const userMoved = useSharedValue(false);
  const savedScale = useSharedValue(INITIAL_SCALE);
  const savedTx = useSharedValue(initialOffset.x);
  const savedTy = useSharedValue(initialOffset.y);

  useEffect(() => {
    if (userMoved.value) return;
    tx.value = initialOffset.x;
    ty.value = initialOffset.y;
    savedTx.value = initialOffset.x;
    savedTy.value = initialOffset.y;
    scale.value = INITIAL_SCALE;
    savedScale.value = INITIAL_SCALE;
  }, [initialOffset.x, initialOffset.y]);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      userMoved.value = true;
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      "worklet";
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    });

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      "worklet";
      userMoved.value = true;
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      "worklet";
      scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated style
  const transformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const zoomIn = useCallback(() => {
    console.log("[MindmapCanvas] Zoom in");
    userMoved.value = true;
    scale.value = withSpring(clamp(scale.value * 1.2, MIN_SCALE, MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    console.log("[MindmapCanvas] Zoom out");
    userMoved.value = true;
    scale.value = withSpring(clamp(scale.value / 1.2, MIN_SCALE, MAX_SCALE));
  }, []);

  const handlePersonPress = useCallback(
    (person: Person) => {
      console.log("[MindmapCanvas] handlePersonPress called for:", person.name);
      onPersonPress(person);
    },
    [onPersonPress]
  );

  // Render connections
  const connections = useMemo(() => {
    const lines: React.ReactElement[] = [];
    const drawn = new Set<string>();

    for (const person of people) {
      if (typeof person.x !== "number" || typeof person.y !== "number") continue;

      for (const connId of person.connections) {
        const key = [person.id, connId].sort().join("-");
        if (drawn.has(key)) continue;
        drawn.add(key);

        const other = people.find((p) => p.id === connId);
        if (!other || typeof other.x !== "number" || typeof other.y !== "number") continue;

        lines.push(
          <Line
            key={key}
            x1={person.x}
            y1={person.y}
            x2={other.x}
            y2={other.y}
            stroke={SVG_COLORS.lineStroke}
            strokeWidth={1.5}
          />
        );
      }
    }

    return lines;
  }, [people]);

  // Render nodes
  const nodes = useMemo(() => {
    return people.map((person) => {
      if (typeof person.x !== "number" || typeof person.y !== "number") return null;

      const initials = getInitials(person.name);

      return (
        <G key={person.id}>
          <Circle
            cx={person.x}
            cy={person.y}
            r={NODE_RADIUS}
            fill={SVG_COLORS.nodeBackground}
            stroke={SVG_COLORS.nodeStroke}
            strokeWidth={1.5}
          />

          <SvgText
            x={person.x}
            y={person.y + 5}
            fill={SVG_COLORS.textSecondary}
            fontSize={14}
            fontWeight="600"
            textAnchor="middle"
          >
            {initials}
          </SvgText>

          <SvgText
            x={person.x}
            y={person.y + 55}
            fill={SVG_COLORS.textPrimary}
            fontSize={13}
            fontWeight="600"
            textAnchor="middle"
          >
            {person.name}
          </SvgText>

          <SvgText
            x={person.x}
            y={person.y + 70}
            fill={SVG_COLORS.textSecondary}
            fontSize={11}
            fontWeight="400"
            textAnchor="middle"
          >
            {person.role}
          </SvgText>
        </G>
      );
    });
  }, [people]);

  // Pre-compute touch target data
  const touchTargets = useMemo(() => {
    return people
      .filter((p) => typeof p.x === "number" && typeof p.y === "number")
      .map((person) => ({
        id: person.id,
        person,
        x: person.x as number,
        y: person.y as number,
      }));
  }, [people]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.canvasContainer}>
          <Animated.View style={[styles.transformLayer, transformStyle]}>
            <Svg
              width={SCREEN_WIDTH * 2}
              height={(SCREEN_HEIGHT - CANVAS_HEIGHT_OFFSET) * 2}
            >
              {connections}
              {nodes}
            </Svg>
          </Animated.View>

          <Animated.View
            style={[styles.touchLayer, transformStyle]}
            pointerEvents="box-none"
          >
            {touchTargets.map(({ id, person, x, y }) => (
              <Pressable
                key={id}
                onPress={() => handlePersonPress(person)}
                style={[
                  styles.touchTarget,
                  {
                    left: x - NODE_RADIUS,
                    top: y - NODE_RADIUS,
                  },
                ]}
              />
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      <View style={styles.zoomControls}>
        <Pressable onPress={zoomIn} style={styles.zoomButton}>
          <Plus size={20} color={SvgColors.text} strokeWidth={2} />
        </Pressable>
        <Pressable onPress={zoomOut} style={styles.zoomButton}>
          <Minus size={20} color={SvgColors.text} strokeWidth={2} />
        </Pressable>
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
    width: SCREEN_WIDTH * 2,
    height: (SCREEN_HEIGHT - CANVAS_HEIGHT_OFFSET) * 2,
  },
  touchTarget: {
    position: "absolute",
    width: NODE_RADIUS * 2,
    height: NODE_RADIUS * 2,
    borderRadius: NODE_RADIUS,
  },
  zoomControls: {
    position: "absolute",
    bottom: Spacing[20],
    right: Spacing[4],
    gap: Spacing[2],
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: colors.borderOpacity[15],
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },
});