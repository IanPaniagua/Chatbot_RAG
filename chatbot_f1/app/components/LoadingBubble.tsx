const LoadingBubble = () => {
    return (
        <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-4 border-t-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
        </div>
    );
}

export default LoadingBubble;