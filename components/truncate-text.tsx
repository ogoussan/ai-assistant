interface TruncatedText {
    content: string,
    maxLength: number
}

export function TruncatedText({content, maxLength}: TruncatedText) {

    return (
        <div className="text-md text-gray-500">
            {content.substring(0, 20)} {content.length >= maxLength && '...'}
        </div>
    )
}