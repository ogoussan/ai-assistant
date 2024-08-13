interface TurnicatedText {
    content: string,
    maxLength: number
}

export function TurnicatedText({content, maxLength}: TurnicatedText) {

    return (
        <div className="text-md text-gray-500">
            {content.substring(0, 20)} {content.length >= maxLength && '...'}
        </div>
    )
}