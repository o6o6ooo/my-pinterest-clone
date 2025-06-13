export default function FormButton({
    children,
    loading = false,
    loadingText = 'Loading...',
    type = 'submit',
    onClick,
    disabled = false,
    fullWidth = true,
}) {
    const isDisabled = loading || disabled;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`px-4 rounded-lg font-medium transition-colors flex items-center justify-center
                ${fullWidth ? 'w-full py-3' : 'w-auto py-2 px-3'}
                ${loading ? 'bg-[#0A4A6E]/50 cursor-not-allowed' : 'bg-[#0A4A6E] hover:bg-[#08324E] text-white'}`}
        >
            {loading ? (
                <>
                    {loadingText}
                    <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full slow-spin ml-2"></div>
                </>
            ) : (
                children
            )}
        </button>
    );
}