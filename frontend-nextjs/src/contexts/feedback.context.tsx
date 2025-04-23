"use client";
import React from "react";

type TSeverity = "success" | "error" | "warning" | "info" | null;

type TFeedbackContext = {
  feedback: {
    isActive: boolean;
    message: string;
    severity: TSeverity;
  };
  setFeedback: React.Dispatch<
    React.SetStateAction<{
      isActive: boolean;
      message: string;
      severity: TSeverity;
    }>
  >;
  resetFeedBack: () => void;
};

const FeedbackContext = React.createContext<TFeedbackContext | null>(null);

export function useFeedbackContext() {
  const context = React.useContext(FeedbackContext);
  if (!context) {
    throw new Error(
      "useFeedbackContext must be used within a FeedbackProvider"
    );
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

  function resetFeedBack() {
    setTimeout(() => {
      setFeedback({
        isActive: false,
        message: "",
        severity: null,
      });
    }, 3000);
  }

  return (
    <FeedbackContext.Provider value={{ feedback, setFeedback, resetFeedBack }}>
      {children}
    </FeedbackContext.Provider>
  );
}
