"use client";

import { motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	Download,
	Search,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PDFViewerProps {
	src: string;
	title: string;
	onProgress?: (page: number, totalPages: number) => void;
	className?: string;
}

export function PDFViewer({
	src,
	title,
	onProgress,
	className = "",
}: PDFViewerProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [zoom, setZoom] = useState(100);
	const [searchTerm, setSearchTerm] = useState("");

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			onProgress?.(page, totalPages);
		}
	};

	const handleZoomIn = () => {
		setZoom((prev) => Math.min(prev + 25, 200));
	};

	const handleZoomOut = () => {
		setZoom((prev) => Math.max(prev - 25, 50));
	};

	const handleDownload = () => {
		const link = document.createElement("a");
		link.href = src;
		link.download = `${title}.pdf`;
		link.click();
	};

	return (
		<div
			className={`overflow-hidden rounded-lg border border-border bg-card ${className}`}
		>
			{/* PDF Toolbar */}
			<div className="flex items-center justify-between border-border border-b bg-muted/30 p-4">
				<div className="flex items-center gap-2">
					<Button
						size="icon"
						variant="outline"
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage <= 1}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					<span className="text-muted-foreground text-sm">
						Page {currentPage} of {totalPages}
					</span>

					<Button
						size="icon"
						variant="outline"
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>

				<div className="flex items-center gap-2">
					{/* Search */}
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
						<Input
							placeholder="Search in PDF..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-48 pl-10"
						/>
					</div>

					{/* Zoom Controls */}
					<Button size="icon" variant="outline" onClick={handleZoomOut}>
						<ZoomOut className="h-4 w-4" />
					</Button>

					<span className="min-w-[50px] text-center text-muted-foreground text-sm">
						{zoom}%
					</span>

					<Button size="icon" variant="outline" onClick={handleZoomIn}>
						<ZoomIn className="h-4 w-4" />
					</Button>

					{/* Download */}
					<Button size="icon" variant="outline" onClick={handleDownload}>
						<Download className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* PDF Content */}
			<div className="relative h-[600px] overflow-auto bg-gray-100 dark:bg-gray-900">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex justify-center p-4"
					style={{
						transform: `scale(${zoom / 100})`,
						transformOrigin: "top center",
					}}
				>
					<iframe
						src={`${src}#page=${currentPage}&zoom=${zoom}`}
						className="h-full w-full border-0 bg-white shadow-lg"
						title={title}
						onLoad={() => {
							// In a real implementation, you'd extract page count from PDF
							setTotalPages(10); // Placeholder
						}}
					/>
				</motion.div>
			</div>

			{/* Page Navigation */}
			<div className="flex items-center justify-center gap-2 border-border border-t p-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => handlePageChange(1)}
					disabled={currentPage === 1}
				>
					First
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage <= 1}
				>
					Previous
				</Button>

				<div className="flex items-center gap-1">
					<Input
						type="number"
						value={currentPage}
						onChange={(e) => handlePageChange(Number(e.target.value))}
						className="w-16 text-center"
						min={1}
						max={totalPages}
					/>
					<span className="text-muted-foreground text-sm">of {totalPages}</span>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					Next
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => handlePageChange(totalPages)}
					disabled={currentPage === totalPages}
				>
					Last
				</Button>
			</div>
		</div>
	);
}
