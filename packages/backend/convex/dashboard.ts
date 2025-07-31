import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mock data for development
const mockFriends = [
	{
		id: "1",
		name: "Sarah Kimani",
		avatar: "/placeholder.svg?height=64&width=64",
		status: "online",
		currentCourse: "Advanced Mathematics Form 4",
		studyStreak: 15,
		lastSeen: "now",
	},
	{
		id: "2",
		name: "John Mwangi",
		avatar: "/placeholder.svg?height=64&width=64",
		status: "busy",
		currentCourse: "Physics Form 3",
		studyStreak: 8,
		lastSeen: "2 hours ago",
	},
	{
		id: "3",
		name: "Grace Wanjiku",
		avatar: "/placeholder.svg?height=64&width=64",
		status: "offline",
		currentCourse: "Chemistry Form 4",
		studyStreak: 22,
		lastSeen: "1 day ago",
	},
	{
		id: "4",
		name: "Peter Ochieng",
		avatar: "/placeholder.svg?height=64&width=64",
		status: "online",
		currentCourse: "Biology Form 3",
		studyStreak: 5,
		lastSeen: "now",
	},
];

const mockPastPapers = [
	{
		id: "1",
		title: "KCSE Mathematics Paper 1 2023",
		subject: "Mathematics",
		form: "Form 4",
		year: 2023,
		type: "KCSE",
		fileSize: "2.5 MB",
		downloads: 1250,
		uploadDate: "2 weeks ago",
	},
	{
		id: "2",
		title: "Physics CAT 2 Form 3",
		subject: "Physics",
		form: "Form 3",
		year: 2024,
		type: "CAT",
		fileSize: "1.8 MB",
		downloads: 890,
		uploadDate: "1 week ago",
	},
	{
		id: "3",
		title: "KCSE Chemistry Paper 2 2022",
		subject: "Chemistry",
		form: "Form 4",
		year: 2022,
		type: "KCSE",
		fileSize: "3.2 MB",
		downloads: 2100,
		uploadDate: "3 weeks ago",
	},
	{
		id: "4",
		title: "Biology End Term Exam",
		subject: "Biology",
		form: "Form 3",
		year: 2024,
		type: "CAT",
		fileSize: "2.1 MB",
		downloads: 650,
		uploadDate: "4 days ago",
	},
];

const mockTests = [
	{
		id: "1",
		title: "Calculus Integration Quiz",
		course: "Advanced Mathematics Form 4",
		type: "quiz",
		status: "pending",
		questions: 15,
		duration: 30,
		dueDate: "2024-02-25",
		bestScore: null,
		attempts: 0,
	},
	{
		id: "2",
		title: "Wave Motion Test",
		course: "Physics Form 3",
		type: "test",
		status: "completed",
		questions: 20,
		duration: 45,
		dueDate: "2024-02-20",
		bestScore: 85,
		attempts: 2,
	},
	{
		id: "3",
		title: "Organic Chemistry Assessment",
		course: "Chemistry Form 4",
		type: "assessment",
		status: "pending",
		questions: 25,
		duration: 60,
		dueDate: "2024-03-01",
		bestScore: null,
		attempts: 0,
	},
	{
		id: "4",
		title: "Cell Biology Quiz",
		course: "Biology Form 3",
		type: "quiz",
		status: "completed",
		questions: 12,
		duration: 25,
		dueDate: "2024-02-15",
		bestScore: 92,
		attempts: 1,
	},
];

const mockCourses = [
	{
		id: "1",
		title: "Advanced Mathematics Form 4",
		instructor: "Dr. Sarah Kimani",
		category: "mathematics",
		progress: 75,
		totalLessons: 24,
		completedLessons: 18,
		nextLesson: "Calculus Integration",
		rating: 4.8,
		students: 1250,
		duration: "12 weeks",
		bgGradient: "from-blue-400 to-blue-600",
	},
	{
		id: "2",
		title: "Physics Form 3 - Mechanics",
		instructor: "Prof. John Mwangi",
		category: "sciences",
		progress: 60,
		totalLessons: 20,
		completedLessons: 12,
		nextLesson: "Newton's Laws of Motion",
		rating: 4.7,
		students: 980,
		duration: "10 weeks",
		bgGradient: "from-green-400 to-green-600",
	},
	{
		id: "3",
		title: "Chemistry Form 4 - Organic",
		instructor: "Dr. Mary Wanjiku",
		category: "sciences",
		progress: 85,
		totalLessons: 16,
		completedLessons: 14,
		nextLesson: "Organic Synthesis",
		rating: 4.9,
		students: 750,
		duration: "8 weeks",
		bgGradient: "from-purple-400 to-purple-600",
	},
	{
		id: "4",
		title: "English Literature Form 4",
		instructor: "Ms. Grace Mutua",
		category: "languages",
		progress: 45,
		totalLessons: 18,
		completedLessons: 8,
		nextLesson: "Poetry Analysis",
		rating: 4.6,
		students: 890,
		duration: "14 weeks",
		bgGradient: "from-pink-400 to-pink-600",
	},
];

export const getFriends = query({
	args: {},
	handler: async (ctx) => {
		// In a real app, this would query the database
		// For now, return mock data
		return mockFriends;
	},
});

export const getPastPapers = query({
	args: {},
	handler: async (ctx) => {
		return mockPastPapers;
	},
});

export const getTests = query({
	args: {},
	handler: async (ctx) => {
		return mockTests;
	},
});

export const getCourses = query({
	args: {},
	handler: async (ctx) => {
		return mockCourses;
	},
});

export const updateStudyTime = mutation({
	args: {
		userId: v.string(),
		timeSpent: v.number(),
	},
	handler: async (ctx, args) => {
		// In a real app, this would update the user's study time in the database
		return { success: true };
	},
});

export const markAssignmentComplete = mutation({
	args: {
		assignmentId: v.string(),
		userId: v.string(),
	},
	handler: async (ctx, args) => {
		// In a real app, this would mark the assignment as complete
		return { success: true };
	},
});
