import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="472"
          height="472"
          viewBox="0 0 512 512"
          fill="none"
        >
          <path
            d="M 256,53 C 368,53 435.5,156.3 435.5,256 C 435.5,355.7 342.9,413.3 256,413.3 C 169.1,413.3 121.3,330.4 121.3,256 C 121.3,181.6 193.9,144 256,144 C 318.1,144 345.3,206.7 345.3,256 C 345.3,305.3 292.9,322.7 256,322.7 C 219.1,322.7 212,280.3 212,256 C 212,231.7 244.3,234.7 256,234.7"
            stroke="#5B5EA6"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
