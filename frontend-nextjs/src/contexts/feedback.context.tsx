"use client";

import { FeedbackSnackBar } from "@/components/shared/feedbackSnackBar";
import React from "react";

type TSeverity = "success" | "error" | "warning" | "info" | null;

type TFeedbackContext = {
    feedback : {
        isActive: boolean;
        message: string;
        severity: TSeverity
    };
    setFeedback: React.Dispatch< 
        React.SetStateAction<{
            isActive: boolean;
            message: string;
            severity: TSeverity;
        }>
    >;
}


const FeedbackContext = React.createContext<TFeedbackContext | null>(null);



export function useFeedbackContext() {
    const context = React.useContext(FeedbackContext);
    if (!context) {
        throw new Error("useFeedbackContext must be used within a FeedbackProvider");
    }
    return context;
}


export function FeedbackContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {    

    const [feedback, setFeedback] = React.useState({
        isActive: false,
        message: "",
        severity: null as TSeverity,
    });

    return (
        <FeedbackContext.Provider value={{ feedback, setFeedback }}>
            {children}
            { feedback.isActive ?? 
                <FeedbackSnackBar message={feedback.message} 
                severity={feedback.severity} 
            />}
        </FeedbackContext.Provider>
    );
}