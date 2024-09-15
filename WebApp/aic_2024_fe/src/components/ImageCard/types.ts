import { BaseComponentProps } from "@types";

export type ImageCardModel = {
    id: string;
    thumbnail: string;
    title: string;
    videoName: string;
    frame: number
    youtubeUrl: string;
    startTime: number;
    fps: number;
    metadata?: React.ReactNode;
}

export type ImageCardProps = Omit<BaseComponentProps, 'children'> & ImageCardModel & {
    type: 'large' | 'medium';
};