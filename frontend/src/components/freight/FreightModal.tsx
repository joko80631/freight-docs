import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { scalePop, defaultTransition } from "@/lib/motion"

interface FreightModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  bodyClassName?: string
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
}

export function FreightModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  bodyClassName,
}: FreightModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg",
              "dark:bg-neutral-900"
            )}
            variants={scalePop}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={defaultTransition}
          >
            {title && (
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            )}
            <div className={cn("mt-4", bodyClassName)}>
              {children}
            </div>
            {footer && (
              <div className="mt-6 flex justify-end space-x-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 