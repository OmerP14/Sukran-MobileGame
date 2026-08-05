import { Image, View } from "react-native";

interface LokumIconProps {
  size?: number;
}

// The source render has a wide glow margin around the cube (it only fills
// ~55% of the canvas), so we zoom in and clip to a square frame — otherwise
// it reads as a tiny speck at the small sizes we use it at (balance chips,
// switch icons).
const ZOOM = 1.75;

export function LokumIcon({ size = 20 }: LokumIconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../../assets/images/lokum.png")}
        style={{ width: size * ZOOM, height: size * ZOOM }}
        resizeMode="contain"
      />
    </View>
  );
}
