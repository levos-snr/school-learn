"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	Maximize,
	Pause,
	Play,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
	src: string;
	title: string;
	onProgress?: (currentTime: number, duration: number) => void;
	onComplete?: () => void;
	initialTime?: number;
	className?: string;
}

export function VideoPlayer({
	src,
	title,
	onProgress,
	onComplete,
	initialTime = 0,
	className = "",
}: VideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [showControls, setShowControls] = useState(true);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const controlsTimeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		// Reset states when src changes
		setError(null);
		setIsLoading(true);
		setDuration(0);
		setCurrentTime(0);
		setIsPlaying(false);

		const handleLoadStart = () => {
			setIsLoading(true);
			setError(null);
		};

		const handleLoadedMetadata = () => {
			setIsLoading(false);
			setDuration(video.duration);
			if (initialTime > 0 && initialTime < video.duration) {
				video.currentTime = initialTime;
				setCurrentTime(initialTime);
			}
		};

		const handleCanPlay = () => {
			setIsLoading(false);
		};

		const handleTimeUpdate = () => {
			const current = video.currentTime;
			setCurrentTime(current);
			onProgress?.(current, video.duration);

			// Check if video is completed (within 5 seconds of end)
			if (video.duration - current < 5 && !video.paused) {
				onComplete?.();
			}
		};

		const handleEnded = () => {
			setIsPlaying(false);
			onComplete?.();
		};

		const handleError = (e: Event) => {
			setIsLoading(false);
			setIsPlaying(false);
			
			const videoElement = e.target as HTMLVideoElement;
			const errorCode = videoElement.error?.code;
			
			let errorMessage = "An unknown error occurred";
			switch (errorCode) {
				case MediaError.MEDIA_ERR_ABORTED:
					errorMessage = "Video playback was aborted";
					break;
				case MediaError.MEDIA_ERR_NETWORK:
					errorMessage = "Network error while loading video";
					break;
				case MediaError.MEDIA_ERR_DECODE:
					errorMessage = "Error decoding video";
					break;
				case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
					errorMessage = "Video format not supported or source not found";
					break;
			}
			
			console.error("Video error:", errorMessage, "Source:", src);
			setError(errorMessage);
		};

		const handleWaiting = () => {
			setIsLoading(true);
		};

		const handlePlaying = () => {
			setIsLoading(false);
		};

		// Add event listeners
		video.addEventListener("loadstart", handleLoadStart);
		video.addEventListener("loadedmetadata", handleLoadedMetadata);
		video.addEventListener("canplay", handleCanPlay);
		video.addEventListener("timeupdate", handleTimeUpdate);
		video.addEventListener("ended", handleEnded);
		video.addEventListener("error", handleError);
		video.addEventListener("waiting", handleWaiting);
		video.addEventListener("playing", handlePlaying);

		// Load the video
		video.load();

		return () => {
			video.removeEventListener("loadstart", handleLoadStart);
			video.removeEventListener("loadedmetadata", handleLoadedMetadata);
			video.removeEventListener("canplay", handleCanPlay);
			video.removeEventListener("timeupdate", handleTimeUpdate);
			video.removeEventListener("ended", handleEnded);
			video.removeEventListener("error", handleError);
			video.removeEventListener("waiting", handleWaiting);
			video.removeEventListener("playing", handlePlaying);
		};
	}, [src, initialTime, onProgress, onComplete]);

	const togglePlay = async () => {
		const video = videoRef.current;
		if (!video || error) return;

		try {
			if (isPlaying) {
				video.pause();
				setIsPlaying(false);
			} else {
				await video.play();
				setIsPlaying(true);
			}
		} catch (err) {
			console.error("Error playing video:", err);
			setError("Failed to play video");
		}
	};

	const handleSeek = (value: number[]) => {
		const video = videoRef.current;
		if (!video || error) return;

		const newTime = value[0];
		video.currentTime = newTime;
		setCurrentTime(newTime);
	};

	const handleVolumeChange = (value: number[]) => {
		const video = videoRef.current;
		if (!video) return;

		const newVolume = value[0];
		video.volume = newVolume;
		setVolume(newVolume);
		setIsMuted(newVolume === 0);
	};

	const toggleMute = () => {
		const video = videoRef.current;
		if (!video) return;

		if (isMuted) {
			video.volume = volume;
			setIsMuted(false);
		} else {
			video.volume = 0;
			setIsMuted(true);
		}
	};

	const skip = (seconds: number) => {
		const video = videoRef.current;
		if (!video || error) return;

		const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
		video.currentTime = newTime;
		setCurrentTime(newTime);
	};

	const changePlaybackRate = (rate: number) => {
		const video = videoRef.current;
		if (!video) return;

		video.playbackRate = rate;
		setPlaybackRate(rate);
	};

	const toggleFullscreen = () => {
		const container = videoRef.current?.parentElement;
		if (!container) return;

		if (!isFullscreen) {
			container.requestFullscreen?.();
		} else {
			document.exitFullscreen?.();
		}
		setIsFullscreen(!isFullscreen);
	};

	const showControlsTemporarily = () => {
		setShowControls(true);
		if (controlsTimeoutRef.current) {
			clearTimeout(controlsTimeoutRef.current);
		}
		controlsTimeoutRef.current = setTimeout(() => {
			if (isPlaying) {
				setShowControls(false);
			}
		}, 3000);
	};

	const formatTime = (time: number) => {
		if (!isFinite(time)) return "0:00";
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	// Helper function to get supported video formats
	const getSupportedFormats = () => {
		const video = document.createElement('video');
		const formats = [];
		
		if (video.canPlayType('video/mp4')) formats.push('MP4');
		if (video.canPlayType('video/webm')) formats.push('WebM');
		if (video.canPlayType('video/ogg')) formats.push('Ogg');
		
		return formats;
	};

	return (
		<div
			className={`relative overflow-hidden rounded-lg bg-black ${className}`}
			onMouseMove={showControlsTemporarily}
			onMouseLeave={() => isPlaying && setShowControls(false)}
		>
			<video
				ref={videoRef}
				className="h-full w-full"
				onClick={togglePlay}
				preload="metadata"
				crossOrigin="anonymous"
			>
				{/* Multiple source formats for better compatibility */}
				<source src={src} type="video/mp4" />
				<source src={src.replace(/\.[^/.]+$/, ".webm")} type="video/webm" />
				Your browser does not support the video tag.
			</video>

			{/* Loading Overlay */}
			{isLoading && !error && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/50">
					<div className="flex flex-col items-center gap-2">
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
						<span className="text-white text-sm">Loading video...</span>
					</div>
				</div>
			)}

			{/* Error Overlay */}
			{error && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/80">
					<div className="flex max-w-md flex-col items-center gap-4 rounded-lg bg-white/10 p-6 text-center backdrop-blur-sm">
						<AlertTriangle className="h-12 w-12 text-red-400" />
						<div>
							<h3 className="mb-2 font-medium text-white">Video Error</h3>
							<p className="mb-4 text-white/80 text-sm">{error}</p>
							<div className="text-white/60 text-xs">
								<p>Video source: {src}</p>
								<p>Supported formats: {getSupportedFormats().join(', ')}</p>
							</div>
						</div>
						<Button
							variant="secondary"
							size="sm"
							onClick={() => {
								setError(null);
								videoRef.current?.load();
							}}
						>
							Retry
						</Button>
					</div>
				</div>
			)}

			{/* Play Button Overlay */}
			<AnimatePresence>
				{!isPlaying && !isLoading && !error && duration > 0 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="absolute inset-0 flex items-center justify-center bg-black/30"
					>
						<Button
							size="icon"
							variant="secondary"
							className="h-16 w-16 rounded-full bg-white/90 hover:bg-white"
							onClick={togglePlay}
						>
							<Play className="ml-1 h-8 w-8 text-black" />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Controls */}
			<AnimatePresence>
				{showControls && !error && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4"
					>
						{/* Progress Bar */}
						<div className="mb-4">
							<Slider
								value={[currentTime]}
								max={duration || 100}
								step={1}
								onValueChange={handleSeek}
								className="w-full"
								disabled={!duration}
							/>
							<div className="mt-1 flex justify-between text-white/70 text-xs">
								<span>{formatTime(currentTime)}</span>
								<span>{formatTime(duration)}</span>
							</div>
						</div>

						{/* Control Buttons */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Button
									size="icon"
									variant="ghost"
									className="text-white hover:bg-white/20"
									onClick={() => skip(-10)}
									disabled={!duration}
								>
									<SkipBack className="h-4 w-4" />
								</Button>

								<Button
									size="icon"
									variant="ghost"
									className="text-white hover:bg-white/20"
									onClick={togglePlay}
									disabled={!duration}
								>
									{isPlaying ? (
										<Pause className="h-4 w-4" />
									) : (
										<Play className="h-4 w-4" />
									)}
								</Button>

								<Button
									size="icon"
									variant="ghost"
									className="text-white hover:bg-white/20"
									onClick={() => skip(10)}
									disabled={!duration}
								>
									<SkipForward className="h-4 w-4" />
								</Button>

								{/* Volume Control */}
								<div className="flex items-center gap-2">
									<Button
										size="icon"
										variant="ghost"
										className="text-white hover:bg-white/20"
										onClick={toggleMute}
									>
										{isMuted ? (
											<VolumeX className="h-4 w-4" />
										) : (
											<Volume2 className="h-4 w-4" />
										)}
									</Button>
									<div className="w-20">
										<Slider
											value={[isMuted ? 0 : volume]}
											max={1}
											step={0.1}
											onValueChange={handleVolumeChange}
										/>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{/* Playback Speed */}
								<select
									value={playbackRate}
									onChange={(e) => changePlaybackRate(Number(e.target.value))}
									className="rounded border border-white/30 bg-transparent px-2 py-1 text-sm text-white"
									disabled={!duration}
								>
									<option value={0.5} className="text-black">
										0.5x
									</option>
									<option value={0.75} className="text-black">
										0.75x
									</option>
									<option value={1} className="text-black">
										1x
									</option>
									<option value={1.25} className="text-black">
										1.25x
									</option>
									<option value={1.5} className="text-black">
										1.5x
									</option>
									<option value={2} className="text-black">
										2x
									</option>
								</select>

								<Button
									size="icon"
									variant="ghost"
									className="text-white hover:bg-white/20"
									onClick={toggleFullscreen}
								>
									<Maximize className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
