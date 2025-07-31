"use client";

import { useState } from "react";
import { AgeInputStep } from "./steps/age-input-step";
import { CompletionStep } from "./steps/completion-step";
import { CourseDetailStep } from "./steps/course-detail-step";
import { EffectivenessStep } from "./steps/effectiveness-step";
import { FitInStep } from "./steps/fit-in-step";
import { FocusStep } from "./steps/focus-step";
import { GoalsStep } from "./steps/goals-step";
import { LetsStartStep } from "./steps/lets-start-step";
import { LevelsStep } from "./steps/levels-step";
import { LoadingStep } from "./steps/loading-step";
import { PathReadyStep } from "./steps/path-ready-step";
import { RecommendationsStep } from "./steps/recommendations-step";
import { ScheduleStep } from "./steps/schedule-step";
import { SubjectsStep } from "./steps/subjects-step";
import { TestimonialStep } from "./steps/testimonial-step";
import { TimeCommitmentStep } from "./steps/time-commitment-step";
import { WelcomeStep } from "./steps/welcome-step";

interface OnboardingData {
	goal?: string;
	focus?: string;
	subject?: string;
	level?: string;
	timeCommitment?: string;
	schedule?: string;
	recommendation?: string;
	age?: string;
}

interface OnboardingFlowProps {
	onComplete: (data: OnboardingData) => void;
	onTryLesson?: () => void;
	disabled?: boolean;
}

export function OnboardingFlow({
	onComplete,
	onTryLesson,
	disabled = false,
}: OnboardingFlowProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

	const updateData = (key: keyof OnboardingData, value: string) => {
		setOnboardingData((prev) => ({ ...prev, [key]: value }));
	};

	const nextStep = () => setCurrentStep((prev) => prev + 1);
	const prevStep = () => setCurrentStep((prev) => prev - 1);

	const handleComplete = () => {
		if (disabled) return;
		onComplete(onboardingData);
	};

	const handleTryLesson = () => {
		if (disabled) return;
		if (onTryLesson) {
			onTryLesson();
		} else {
			// Default behavior - redirect to dashboard
			handleComplete();
		}
	};

	const steps = [
		<WelcomeStep key="welcome" onContinue={nextStep} disabled={disabled} />,
		<GoalsStep
			key="goals"
			onBack={prevStep}
			onContinue={(goal) => {
				updateData("goal", goal);
				nextStep();
			}}
			disabled={disabled}
		/>,
		<FocusStep
			key="focus"
			onBack={prevStep}
			onContinue={(focus) => {
				updateData("focus", focus);
				nextStep();
			}}
			disabled={disabled}
		/>,
		<FitInStep
			key="fit-in"
			onBack={prevStep}
			onContinue={nextStep}
			disabled={disabled}
		/>,
		<SubjectsStep
			key="subjects"
			onBack={prevStep}
			onContinue={(subject) => {
				updateData("subject", subject);
				nextStep();
			}}
			disabled={disabled}
		/>,
		<LevelsStep
			key="levels"
			onBack={prevStep}
			onContinue={(level) => {
				updateData("level", level);
				nextStep();
			}}
			disabled={disabled}
		/>,
		<EffectivenessStep
			key="effectiveness"
			onBack={prevStep}
			onContinue={nextStep}
			disabled={disabled}
		/>,
		<TimeCommitmentStep
			key="time"
			onBack={prevStep}
			onContinue={(time) => {
				updateData("timeCommitment", time);
				nextStep();
			}}
			disabled={disabled}
		/>,
		<ScheduleStep
			key="schedule"
			onBack={prevStep}
			onContinue={(schedule) => {
				updateData("schedule", schedule);
				nextStep();
			}}
			disabled={disabled}
		/>,
		<CompletionStep
			key="completion"
			onContinue={nextStep}
			disabled={disabled}
		/>,
		<LoadingStep key="loading" onComplete={nextStep} disabled={disabled} />,
		<RecommendationsStep
			key="recommendations"
			onBack={prevStep}
			onContinue={(recommendation) => {
				updateData("recommendation", recommendation);
				nextStep();
			}}
			disabled={disabled}
		/>,
		<CourseDetailStep
			key="course-detail"
			onBack={prevStep}
			onContinue={nextStep}
			disabled={disabled}
		/>,
		<LetsStartStep
			key="lets-start"
			onBack={prevStep}
			onContinue={nextStep}
			disabled={disabled}
		/>,
		<AgeInputStep
			key="age-input"
			onBack={prevStep}
			onContinue={(age) => {
				updateData("age", age);
				nextStep();
			}}
			disabled={disabled}
		/>,
		<TestimonialStep
			key="testimonial"
			onBack={prevStep}
			onContinue={nextStep}
			disabled={disabled}
		/>,
		<PathReadyStep
			key="path-ready"
			onBack={prevStep}
			onContinue={handleComplete}
			onTryLesson={handleTryLesson}
			disabled={disabled}
		/>,
	];

	return <div className="min-h-screen">{steps[currentStep]}</div>;
}
