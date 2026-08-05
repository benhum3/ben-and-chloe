import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#181818",
        color: "#d2a641",
        display: "flex",
        fontFamily: "serif",
        fontSize: 25,
        height: "100%",
        justifyContent: "center",
        letterSpacing: -2,
        width: "100%",
      }}
    >
      B&amp;C
    </div>,
    size,
  );
}
