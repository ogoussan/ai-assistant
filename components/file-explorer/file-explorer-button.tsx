import { AnimationProps, motion } from "framer-motion"
import { ReactNode } from "react"
import { Button } from "../ui/button"

export interface FileExplorerButtonProps extends AnimationProps {
    onClick: () => void,
    icon: () => ReactNode,
    leftContent?: () => ReactNode,
    rightContent?: () => ReactNode,
    label?: string,
    initial?: any,
    animate?: any,
    transition?: any
}

export function FileExplorerButton({
    onClick,
    icon: ButtonIcon,
    rightContent: RightContent,
    leftContent: LeftContent,
    label,
    initial,
    animate,
    transition,
    ...animationProps
}: FileExplorerButtonProps) {
    return (
        <motion.div
            className="flex gap-4 items-center pr-4"
            initial={initial}
            animate={animate}
            transition={transition}
            {...animationProps}
        >
            {LeftContent && <LeftContent />}
            <Button
                className="w-full flex"
                variant="outline"
                onClick={onClick}
            >
                <ButtonIcon />
                <small className="text-xs">{label}</small>
            </Button>
            {RightContent && <RightContent />}
        </motion.div>
    )
}