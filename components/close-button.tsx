import { ButtonHTMLAttributes, HTMLAttributes } from "react"

export function CloseButton(props: HTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className="inline-flex border border-forground items-center justify-center rounded-full bg-background text-primary font-medium px-1 py-1 text-xs">
      <XIcon className="h-3 w-3" />
    </button>
  )
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
