import { IconSpinner } from "@/components/ui/icons";

export default function Loading() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <IconSpinner className="size-12" />
        </div>
    )
  }