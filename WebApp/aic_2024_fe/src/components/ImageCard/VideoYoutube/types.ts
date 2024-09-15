import { MutableRefObject } from "react";

export type VideoYoutubeProps = {
  videoUrl: string;
  startTime: number; // Time in seconds to start the video
  width: number;
  height: number;
  fps: number; // Custom field, but can't actually set fps in iframe
  currentVideoFrame: number;
  setCurrentVideoFrame: (frame: number) => void;
  intervalRef: MutableRefObject<number | undefined>;
  stopInterval: () => void;
};
