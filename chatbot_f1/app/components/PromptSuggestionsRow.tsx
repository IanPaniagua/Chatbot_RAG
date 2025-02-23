import PromptSuggestionBotton from "./PromptSuggestionBotton";

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
        "Who is the current F1 champion?",
        "Who is the highest paid F1 driver?",
        "What is the fastest F1 car?",
        "Who is the youngest F1 driver?",
        "What is the most successful F1 team?",
        "What is the most dangerous F1 track?",
    ]

    return (
        <div>
            {prompts.map((prompt, index) => <PromptSuggestionBotton 
            key={`suggestion-${index}`}
            text={prompt}
            onClick={onPromptClick}
            />)}
        </div>
    )
}

export default PromptSuggestionsRow;