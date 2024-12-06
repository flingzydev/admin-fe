import React, {useCallback, useEffect, useRef, useState} from "react";
import noUiSlider, { API } from "nouislider";
import "nouislider/dist/nouislider.css";

interface VideoEditorProps {
    videoUrl: string | undefined;
    onEdit: (start: number, end: number, rotation: number) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ videoUrl, onEdit }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number>();
    const [duration, setDuration] = useState<number>(0);
    const [rangeValues, setRangeValues] = useState<[number, number]>([0, 0]);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270 degrees

    const updatePlaybackProgress = useCallback(() => {
        if (videoRef.current && isPlaying) {
            setCurrentTime(videoRef.current.currentTime);

            if (videoRef.current.currentTime >= rangeValues[1]) {
                videoRef.current.pause();
                setIsPlaying(false);
                videoRef.current.currentTime = rangeValues[0];
            } else {
                animationFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
            }
        }
    }, [isPlaying, rangeValues]);

    useEffect(() => {
        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, rangeValues, updatePlaybackProgress]);

    useEffect(() => {
        const sliderElement = sliderRef.current;

        if (sliderElement && duration > 0 && !sliderElement.hasAttribute('data-slider-initialized')) {
            const slider = noUiSlider.create(sliderElement, {
                start: [0, duration],
                connect: true,
                range: {
                    min: 0,
                    max: duration,
                },
                step: 0.05,
                tooltips: [true, true],
                format: {
                    to: (value) => parseFloat(value.toString()).toFixed(2),
                    from: (value) => Number(value),
                }
            });

            sliderElement.setAttribute('data-slider-initialized', 'true');

            slider.on("update", (values: (string | number)[]) => {
                const [start, end] = values.map(v => parseFloat(v.toString()));
                setRangeValues([start, end]);
            });

            return () => {
                slider.destroy();
                if (sliderElement) {
                    sliderElement.removeAttribute('data-slider-initialized');
                }
            };
        }
    }, [duration]);

    useEffect(() => {
        const sliderElement = sliderRef.current;

        if (sliderElement) {
            const slider = sliderElement as unknown as { noUiSlider: API };
            if (slider.noUiSlider) {
                const [start, end] = rangeValues;

                if (currentTime >= start && currentTime <= end) {
                    const percent = ((currentTime - start) / (end - start)) * 100;
                    const connectElement = sliderElement.querySelector('.noUi-connect') as HTMLElement;
                    if (connectElement) {
                        connectElement.style.background = `linear-gradient(90deg, #3B82F6 ${percent}%, #93C5FD ${percent}%)`;
                    }
                }
            }
        }
    }, [currentTime, rangeValues]);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleEnded = () => {
                setIsPlaying(false);
                if (video) {
                    video.currentTime = rangeValues[0];
                }
            };

            video.addEventListener('ended', handleEnded);
            return () => {
                video.removeEventListener('ended', handleEnded);
            };
        }
    }, [rangeValues]);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const videoDuration = videoRef.current.duration;
            setDuration(videoDuration);
            setRangeValues([0, videoDuration]);
        }
    };

    const handlePlay = async () => {
        if (videoRef.current) {
            try {
                videoRef.current.currentTime = rangeValues[0];
                await videoRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error('Error playing video:', error);
                setIsPlaying(false);
            }
        }
    };

    const handlePause = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleRotateLeft = () => {
        setRotation((prev) => (prev - 90 + 360) % 360);
    };

    const handleRotateRight = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleEdit = () => {
        const start = Math.round(rangeValues[0] * 20) / 20;
        const end = Math.round(rangeValues[1] * 20) / 20;
        onEdit(start, end, rotation);
    };

    const formatTime = (time: number) => time.toFixed(2);

    const containerSize = 500;

    const videoContainerStyle = {
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        position: 'relative' as const,
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        margin: '0 auto'
    };

    const videoWrapperStyle = {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative' as const,
    };

    // Determine if orientation is vertical based on actual rotation value
    const isVertical = Math.abs(rotation % 180) === 90;

    const videoStyle = {
        maxWidth: isVertical ? '90%' : '80%',
        maxHeight: isVertical ? '80%' : '90%',
        objectFit: 'contain' as const,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
    };

    return (
        <div className="flex flex-col items-center w-full">
            {/* Video container */}
            <div style={videoContainerStyle}>
                <div style={videoWrapperStyle}>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        style={videoStyle}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        playsInline
                    ></video>
                </div>
            </div>

            {/* Controls container */}
            <div className="mt-8 w-full max-w-[600px]">
                <div ref={sliderRef} className="mb-4"></div>
                <div className="text-center mb-4">
                    {formatTime(currentTime)}
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <p className="w-full text-center">
                        Start: {formatTime(rangeValues[0])}s | End: {formatTime(rangeValues[1])}s | Rotation: {rotation}°
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRotateLeft}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Rotate Left
                        </button>
                        <button
                            onClick={handleRotateRight}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Rotate Right
                        </button>
                        <button
                            onClick={isPlaying ? handlePause : handlePlay}
                            className="w-10 h-10 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <div className="w-3 h-3 bg-white"/>
                            ) : (
                                <div
                                    className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"/>
                            )}
                        </button>
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Edit Video
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoEditor;