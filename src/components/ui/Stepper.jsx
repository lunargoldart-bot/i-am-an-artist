import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Stepper — horizontal progress indicator for multi-step (native feel) flows.
 * Props:
 * - `steps`: array of { id, label }
 * - `currentIndex`: zero-based index of active step
 * - `onStepClick`?: allow jumping back to completed steps
 */
export default function Stepper({ steps, currentIndex, onStepClick }) {
  return (
    <div className="flex items-center w-full" role="list" aria-label="Progress">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const last = i === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              onClick={() => isDone && onStepClick?.(i)}
              className={cn(
                "flex flex-col items-center gap-1.5 outline-none",
                isDone && onStepClick ? "cursor-pointer" : "cursor-default"
              )}
            >
              <motion.span
                initial={false}
                animate={{
                  scale: isActive ? 1.12 : 1,
                  backgroundColor: isDone || isActive ? "hsl(var(--primary))" : "hsl(var(--muted))",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  isDone || isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
              </motion.span>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap transition-colors",
                  isActive ? "text-foreground" : isDone ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>

            {!last && (
              <div className="flex-1 mx-2 h-0.5 rounded-full overflow-hidden bg-muted mt-[-18px]">
                <motion.div
                  initial={false}
                  animate={{ width: isDone ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full bg-primary"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
