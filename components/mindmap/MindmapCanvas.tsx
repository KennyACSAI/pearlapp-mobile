// components/mindmap/MindmapCanvas.tsx
// Animated mindmap with floating nodes, draggable with momentum, animated lines
import React, { useMemo, useCallback, useEffect } from "react";
import { View, StyleSheet, Dimensions, Pressable, Text } from "react-native";
import Svg, { Circle, Line, G, Text as SvgText } from "react-native-svg";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDecay,
  Easing,
  cancelAnimation,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import { Plus, Minus, RotateCcw } from "lucide-react-native";

import { Person, getInitials } from "@/data/sampleData";
import { colors } from "@/constants";

// Create animated SVG Line
const AnimatedLine = Animated.createAnimatedComponent(Line);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MindmapCanvasProps {
  people: Person[];
  onPersonPress: (person: Person) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NODE_RADIUS = 36;
const ME_NODE_RADIUS = 50;
const INITIAL_SCALE = 1;
const MIN_SCALE = 0.3;
const MAX_SCALE = 3;

const FLOAT_DURATION = 6000;
const FLOAT_DISTANCE = 8;

// ============================================================================
// UTILITY
// ============================================================================

function clamp(v: number, min: number, max: number): number {
  "worklet";
  return Math.max(min, Math.min(max, v));
}

// ============================================================================
// TYPES
// ============================================================================

interface NodeLayoutData extends Person {
  x: number;
  y: number;
}

// ============================================================================
// LAYOUT CALCULATION
// ============================================================================

function calculateTreeLayout(
  people: Person[],
  centerX: number,
  centerY: number
) {
  const meNode = {
    id: "me",
    name: "Me",
    x: centerX,
    y: centerY,
    isMe: true,
  };

  const totalPeople = people.length;
  if (totalPeople === 0) {
    return { meNode, peopleNodes: [] };
  }

  const nodePositions: Map<string, { x: number; y: number }> = new Map();

  // Concentric rings
  const firstRingRadius = 140;
  const secondRingRadius = 250;
  const thirdRingRadius = 360;

  const sortedPeople = [...people].sort(
    (a, b) => b.connections.length - a.connections.length
  );

  const firstRingCount = Math.min(6, totalPeople);
  const secondRingCount = Math.min(10, Math.max(0, totalPeople - 6));

  const firstRingPeople = sortedPeople.slice(0, firstRingCount);
  const secondRingPeople = sortedPeople.slice(
    firstRingCount,
    firstRingCount + secondRingCount
  );
  const thirdRingPeople = sortedPeople.slice(firstRingCount + secondRingCount);

  firstRingPeople.forEach((person, index) => {
    const angle = (index / firstRingPeople.length) * 2 * Math.PI - Math.PI / 2;
    nodePositions.set(person.id, {
      x: centerX + Math.cos(angle) * firstRingRadius,
      y: centerY + Math.sin(angle) * firstRingRadius,
    });
  });

  secondRingPeople.forEach((person, index) => {
    const angleOffset = Math.PI / Math.max(1, secondRingPeople.length);
    const angle =
      (index / Math.max(1, secondRingPeople.length)) * 2 * Math.PI - Math.PI / 2 + angleOffset;
    nodePositions.set(person.id, {
      x: centerX + Math.cos(angle) * secondRingRadius,
      y: centerY + Math.sin(angle) * secondRingRadius,
    });
  });

  thirdRingPeople.forEach((person, index) => {
    const angle = (index / Math.max(1, thirdRingPeople.length)) * 2 * Math.PI - Math.PI / 2;
    nodePositions.set(person.id, {
      x: centerX + Math.cos(angle) * thirdRingRadius,
      y: centerY + Math.sin(angle) * thirdRingRadius,
    });
  });

  const peopleNodes: NodeLayoutData[] = people.map((person) => ({
    ...person,
    x: nodePositions.get(person.id)?.x || centerX,
    y: nodePositions.get(person.id)?.y || centerY,
  }));

  return { meNode, peopleNodes };
}

// ============================================================================
// ANIMATED LINE COMPONENT
// ============================================================================

interface AnimatedConnectionLineProps {
  fromX: SharedValue<number>;
  fromY: SharedValue<number>;
  toX: SharedValue<number>;
  toY: SharedValue<number>;
  dashed?: boolean;
}

function AnimatedConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  dashed = false,
}: AnimatedConnectionLineProps) {
  const animatedProps = useAnimatedProps(() => ({
    x1: fromX.value,
    y1: fromY.value,
    x2: toX.value,
    y2: toY.value,
  }));

  return (
    <AnimatedLine
      animatedProps={animatedProps}
      stroke={dashed ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.12)"}
      strokeWidth={dashed ? 1.5 : 2}
      strokeLinecap="round"
      strokeDasharray={dashed ? "6,6" : undefined}
    />
  );
}

// ============================================================================
// FLOATING NODE COMPONENT
// ============================================================================

interface FloatingPersonNodeProps {
  person: NodeLayoutData;
  index: number;
  onPress: () => void;
  canvasScale: SharedValue<number>;
  posX: SharedValue<number>;
  posY: SharedValue<number>;
}

function FloatingPersonNode({
  person,
  index,
  onPress,
  canvasScale,
  posX,
  posY,
}: FloatingPersonNodeProps) {
  const baseX = person.x;
  const baseY = person.y;

  // Floating offsets
  const floatX = useSharedValue(0);
  const floatY = useSharedValue(0);

  // Drag offsets
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const savedDragX = useSharedValue(0);
  const savedDragY = useSharedValue(0);

  // Node scale for press feedback
  const nodeScale = useSharedValue(1);

  // Start floating animation
  useEffect(() => {
    const seed = index * 1.618;
    const dirX = Math.sin(seed) > 0 ? 1 : -1;
    const dirY = Math.cos(seed) > 0 ? 1 : -1;
    const distMult = 0.5 + (index % 7) * 0.1;
    const durMult = 0.8 + (index % 5) * 0.12;
    const dist = FLOAT_DISTANCE * distMult;
    const dur = FLOAT_DURATION * durMult;
    const delay = (index % 8) * 300;

    const timeout = setTimeout(() => {
      floatX.value = withRepeat(
        withSequence(
          withTiming(dist * dirX, { duration: dur, easing: Easing.inOut(Easing.sin) }),
          withTiming(-dist * dirX, { duration: dur, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      floatY.value = withRepeat(
        withSequence(
          withTiming(dist * 0.6 * dirY, { duration: dur * 1.3, easing: Easing.inOut(Easing.sin) }),
          withTiming(-dist * 0.6 * dirY, { duration: dur * 1.3, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimation(floatX);
      cancelAnimation(floatY);
    };
  }, [index]);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      cancelAnimation(dragX);
      cancelAnimation(dragY);
      savedDragX.value = dragX.value;
      savedDragY.value = dragY.value;
      nodeScale.value = withSpring(1.12, { damping: 15, stiffness: 200 });
    })
    .onUpdate((event) => {
      const newDragX = savedDragX.value + event.translationX / canvasScale.value;
      const newDragY = savedDragY.value + event.translationY / canvasScale.value;
      dragX.value = newDragX;
      dragY.value = newDragY;
      // Update shared position for lines
      posX.value = baseX + floatX.value + newDragX;
      posY.value = baseY + floatY.value + newDragY;
    })
    .onEnd((event) => {
      nodeScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      const velocityX = event.velocityX / canvasScale.value;
      const velocityY = event.velocityY / canvasScale.value;

      dragX.value = withDecay(
        { velocity: velocityX, deceleration: 0.992 },
        () => {
          dragX.value = withSpring(0, { damping: 12, stiffness: 40 });
        }
      );
      dragY.value = withDecay(
        { velocity: velocityY, deceleration: 0.992 },
        () => {
          dragY.value = withSpring(0, { damping: 12, stiffness: 40 });
        }
      );
    })
    .minDistance(5);

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onStart(() => {
      nodeScale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
    })
    .onEnd(() => {
      nodeScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      runOnJS(onPress)();
    });

  const composedGesture = Gesture.Exclusive(tapGesture, panGesture);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    const currentX = baseX + floatX.value + dragX.value;
    const currentY = baseY + floatY.value + dragY.value;

    // Keep position synced for lines
    posX.value = currentX;
    posY.value = currentY;

    return {
      transform: [
        { translateX: currentX - NODE_RADIUS },
        { translateY: currentY - NODE_RADIUS },
        { scale: nodeScale.value },
      ],
    };
  });

  const initials = getInitials(person.name);
  const firstName = person.name.split(" ")[0];

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.personNode, animatedStyle]}>
        <View style={styles.nodeShadow} />
        <View style={styles.nodeCircle}>
          <Text style={styles.nodeInitials}>{initials}</Text>
        </View>
        <Text style={styles.nodeName} numberOfLines={1}>{firstName}</Text>
        <Text style={styles.nodeRole} numberOfLines={1}>{person.role}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

// ============================================================================
// ZOOM BUTTON
// ============================================================================

interface ZoomButtonProps {
  onPress: () => void;
  children: React.ReactNode;
}

function ZoomButton({ onPress, children }: ZoomButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.zoomButton,
        pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

// ============================================================================
// RESET BUTTON
// ============================================================================

function ResetButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.resetButton,
        pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
      ]}
    >
      <RotateCcw size={16} color="#000" strokeWidth={2} />
      <Text style={styles.resetButtonText}>Reset</Text>
    </Pressable>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MindmapCanvas({ people, onPersonPress }: MindmapCanvasProps) {
  // Canvas center point (shifted up a bit)
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2 - 120;

  // Calculate layout
  const { meNode, peopleNodes } = useMemo(
    () => calculateTreeLayout(people, centerX, centerY),
    [people, centerX, centerY]
  );

  // Me node position (static)
  const meX = useSharedValue(meNode.x);
  const meY = useSharedValue(meNode.y);

  // Create position shared values for each person node (max 20)
  const p0X = useSharedValue(peopleNodes[0]?.x ?? 0);
  const p0Y = useSharedValue(peopleNodes[0]?.y ?? 0);
  const p1X = useSharedValue(peopleNodes[1]?.x ?? 0);
  const p1Y = useSharedValue(peopleNodes[1]?.y ?? 0);
  const p2X = useSharedValue(peopleNodes[2]?.x ?? 0);
  const p2Y = useSharedValue(peopleNodes[2]?.y ?? 0);
  const p3X = useSharedValue(peopleNodes[3]?.x ?? 0);
  const p3Y = useSharedValue(peopleNodes[3]?.y ?? 0);
  const p4X = useSharedValue(peopleNodes[4]?.x ?? 0);
  const p4Y = useSharedValue(peopleNodes[4]?.y ?? 0);
  const p5X = useSharedValue(peopleNodes[5]?.x ?? 0);
  const p5Y = useSharedValue(peopleNodes[5]?.y ?? 0);
  const p6X = useSharedValue(peopleNodes[6]?.x ?? 0);
  const p6Y = useSharedValue(peopleNodes[6]?.y ?? 0);
  const p7X = useSharedValue(peopleNodes[7]?.x ?? 0);
  const p7Y = useSharedValue(peopleNodes[7]?.y ?? 0);
  const p8X = useSharedValue(peopleNodes[8]?.x ?? 0);
  const p8Y = useSharedValue(peopleNodes[8]?.y ?? 0);
  const p9X = useSharedValue(peopleNodes[9]?.x ?? 0);
  const p9Y = useSharedValue(peopleNodes[9]?.y ?? 0);
  const p10X = useSharedValue(peopleNodes[10]?.x ?? 0);
  const p10Y = useSharedValue(peopleNodes[10]?.y ?? 0);
  const p11X = useSharedValue(peopleNodes[11]?.x ?? 0);
  const p11Y = useSharedValue(peopleNodes[11]?.y ?? 0);
  const p12X = useSharedValue(peopleNodes[12]?.x ?? 0);
  const p12Y = useSharedValue(peopleNodes[12]?.y ?? 0);
  const p13X = useSharedValue(peopleNodes[13]?.x ?? 0);
  const p13Y = useSharedValue(peopleNodes[13]?.y ?? 0);
  const p14X = useSharedValue(peopleNodes[14]?.x ?? 0);
  const p14Y = useSharedValue(peopleNodes[14]?.y ?? 0);
  const p15X = useSharedValue(peopleNodes[15]?.x ?? 0);
  const p15Y = useSharedValue(peopleNodes[15]?.y ?? 0);
  const p16X = useSharedValue(peopleNodes[16]?.x ?? 0);
  const p16Y = useSharedValue(peopleNodes[16]?.y ?? 0);
  const p17X = useSharedValue(peopleNodes[17]?.x ?? 0);
  const p17Y = useSharedValue(peopleNodes[17]?.y ?? 0);
  const p18X = useSharedValue(peopleNodes[18]?.x ?? 0);
  const p18Y = useSharedValue(peopleNodes[18]?.y ?? 0);
  const p19X = useSharedValue(peopleNodes[19]?.x ?? 0);
  const p19Y = useSharedValue(peopleNodes[19]?.y ?? 0);

  // Array of position shared values for easy access
  const allPositions = useMemo(() => [
    { x: p0X, y: p0Y },
    { x: p1X, y: p1Y },
    { x: p2X, y: p2Y },
    { x: p3X, y: p3Y },
    { x: p4X, y: p4Y },
    { x: p5X, y: p5Y },
    { x: p6X, y: p6Y },
    { x: p7X, y: p7Y },
    { x: p8X, y: p8Y },
    { x: p9X, y: p9Y },
    { x: p10X, y: p10Y },
    { x: p11X, y: p11Y },
    { x: p12X, y: p12Y },
    { x: p13X, y: p13Y },
    { x: p14X, y: p14Y },
    { x: p15X, y: p15Y },
    { x: p16X, y: p16Y },
    { x: p17X, y: p17Y },
    { x: p18X, y: p18Y },
    { x: p19X, y: p19Y },
  ], [p0X, p0Y, p1X, p1Y, p2X, p2Y, p3X, p3Y, p4X, p4Y, p5X, p5Y, p6X, p6Y, p7X, p7Y, p8X, p8Y, p9X, p9Y, p10X, p10Y, p11X, p11Y, p12X, p12Y, p13X, p13Y, p14X, p14Y, p15X, p15Y, p16X, p16Y, p17X, p17Y, p18X, p18Y, p19X, p19Y]);

  // Map person IDs to their position index
  const idToIndex = useMemo(() => {
    const map = new Map<string, number>();
    peopleNodes.forEach((person, index) => {
      if (index < 20) {
        map.set(person.id, index);
      }
    });
    return map;
  }, [peopleNodes]);

  // Canvas transform
  const scale = useSharedValue(INITIAL_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(INITIAL_SCALE);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Pan gesture for canvas
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd((event) => {
      translateX.value = withDecay({ velocity: event.velocityX, deceleration: 0.997 });
      translateY.value = withDecay({ velocity: event.velocityY, deceleration: 0.997 });
    })
    .minDistance(10)
    .minPointers(1)
    .maxPointers(2);

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE);
    });

  const canvasGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Transform style
  const transformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    scale.value = withSpring(clamp(scale.value * 1.4, MIN_SCALE, MAX_SCALE), {
      damping: 15,
      stiffness: 150,
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    scale.value = withSpring(clamp(scale.value / 1.4, MIN_SCALE, MAX_SCALE), {
      damping: 15,
      stiffness: 150,
    });
  }, []);

  const handleReset = useCallback(() => {
    scale.value = withSpring(INITIAL_SCALE, { damping: 15, stiffness: 150 });
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, []);

  // Build connection data
  const connectionData = useMemo(() => {
    const connections: Array<{
      key: string;
      fromIndex: number | "me";
      toIndex: number;
      dashed: boolean;
    }> = [];
    const drawn = new Set<string>();

    // Lines from Me to everyone
    peopleNodes.forEach((person, index) => {
      if (index < 20) {
        connections.push({
          key: `me-${person.id}`,
          fromIndex: "me",
          toIndex: index,
          dashed: false,
        });
      }
    });

    // Lines between connected people
    peopleNodes.forEach((person, index) => {
      if (index >= 20) return;
      person.connections.forEach((connId) => {
        const key = [person.id, connId].sort().join("-");
        if (drawn.has(key)) return;
        drawn.add(key);

        const otherIndex = idToIndex.get(connId);
        if (otherIndex === undefined || otherIndex >= 20) return;

        connections.push({
          key,
          fromIndex: index,
          toIndex: otherIndex,
          dashed: true,
        });
      });
    });

    return connections;
  }, [peopleNodes, idToIndex]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={canvasGesture}>
        <Animated.View style={styles.canvasContainer}>
          <Animated.View style={[styles.transformLayer, transformStyle]}>
            {/* SVG for lines and Me node */}
            <Svg
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              style={StyleSheet.absoluteFill}
            >
              {/* Connection lines */}
              {connectionData.map(({ key, fromIndex, toIndex, dashed }) => {
                const fromPos = fromIndex === "me" ? { x: meX, y: meY } : allPositions[fromIndex];
                const toPos = allPositions[toIndex];
                if (!fromPos || !toPos) return null;

                return (
                  <AnimatedConnectionLine
                    key={key}
                    fromX={fromPos.x}
                    fromY={fromPos.y}
                    toX={toPos.x}
                    toY={toPos.y}
                    dashed={dashed}
                  />
                );
              })}

              {/* Me node */}
              <G>
                <Circle
                  cx={meNode.x + 4}
                  cy={meNode.y + 5}
                  r={ME_NODE_RADIUS}
                  fill="rgba(0,0,0,0.1)"
                />
                <Circle
                  cx={meNode.x}
                  cy={meNode.y}
                  r={ME_NODE_RADIUS}
                  fill="#000"
                />
                <SvgText
                  x={meNode.x}
                  y={meNode.y + 8}
                  fill="#FFF"
                  fontSize={24}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Me
                </SvgText>
              </G>
            </Svg>

            {/* Person nodes */}
            {peopleNodes.slice(0, 20).map((person, index) => (
              <FloatingPersonNode
                key={person.id}
                person={person}
                index={index}
                onPress={() => onPersonPress(person)}
                canvasScale={scale}
                posX={allPositions[index].x}
                posY={allPositions[index].y}
              />
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Controls */}
      <View style={styles.zoomControls}>
        <ZoomButton onPress={handleZoomIn}>
          <Plus size={22} color="#000" strokeWidth={2.5} />
        </ZoomButton>
        <ZoomButton onPress={handleZoomOut}>
          <Minus size={22} color="#000" strokeWidth={2.5} />
        </ZoomButton>
      </View>

      <ResetButton onPress={handleReset} />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#000" }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderStyle: "solid" }]} />
          <Text style={styles.legendText}>Direct</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderStyle: "dashed" }]} />
          <Text style={styles.legendText}>Connected</Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

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
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // Person node
  personNode: {
    position: "absolute",
    width: NODE_RADIUS * 2,
    alignItems: "center",
  },
  nodeShadow: {
    position: "absolute",
    top: 4,
    left: 3,
    width: NODE_RADIUS * 2,
    height: NODE_RADIUS * 2,
    borderRadius: NODE_RADIUS,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  nodeCircle: {
    width: NODE_RADIUS * 2,
    height: NODE_RADIUS * 2,
    borderRadius: NODE_RADIUS,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  nodeInitials: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0,0,0,0.6)",
    letterSpacing: 0.5,
  },
  nodeName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    maxWidth: NODE_RADIUS * 2.5,
  },
  nodeRole: {
    marginTop: 2,
    fontSize: 11,
    color: "rgba(0,0,0,0.45)",
    textAlign: "center",
    maxWidth: NODE_RADIUS * 2.5,
  },

  // Controls
  zoomControls: {
    position: "absolute",
    bottom: 36,
    right: 16,
    gap: 10,
  },
  zoomButton: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButton: {
    position: "absolute",
    bottom: 36,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  // Legend
  legend: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    borderColor: "rgba(0,0,0,0.25)",
  },
  legendText: {
    fontSize: 11,
    color: "rgba(0,0,0,0.6)",
    fontWeight: "500",
  },
});