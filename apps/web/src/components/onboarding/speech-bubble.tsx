"use client";

import { useEffect, useState } from "react";

interface SpeechBubbleProps {
	text: string;
	isVisible?: boolean;
	className?: string;
}

export function SpeechBubble({
	text,
	isVisible = true,
	className = "",
}: SpeechBubbleProps) {
	const [displayedText, setDisplayedText] = useState("");
	const [isTyping, setIsTyping] = useState(false);

	useEffect(() => {
		if (!isVisible) {
			setDisplayedText("");
			return;
		}

		setIsTyping(true);
		setDisplayedText("");

		let currentIndex = 0;
		const typingInterval = setInterval(() => {
			if (currentIndex <= text.length) {
				setDisplayedText(text.slice(0, currentIndex));
				currentIndex++;
			} else {
				setIsTyping(false);
				clearInterval(typingInterval);
			}
		}, 50);

		return () => clearInterval(typingInterval);
	}, [text, isVisible]);

	if (!isVisible) return null;

	return (
		<div className={`relative ${className}`}>
			<div className="max-w-sm rounded-2xl border-2 border-yellow-300 bg-yellow-100 px-4 py-3">
				<p className="font-medium text-gray-800">
					{displayedText}
					{isTyping && <span className="animate-pulse">|</span>}
				</p>

				{/* Speech bubble tail */}
				<div className="-bottom-2 absolute left-6 h-4 w-4 rotate-45 transform border-yellow-300 border-r-2 border-b-2 bg-yellow-100" />
			</div>
		</div>
	);
}
