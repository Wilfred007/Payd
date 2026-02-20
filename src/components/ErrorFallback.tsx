import { Button } from "@stellar/design-system";

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    resetErrorBoundary,
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                <p className="text-gray-600 mb-6">
                    An unexpected error occurred in the application. We apologize for the inconvenience.
                </p>
                <div className="bg-red-50 border border-red-100 rounded p-4 mb-6 overflow-auto max-h-40">
                    <code className="text-xs text-red-800 break-all">
                        {error.message}
                    </code>
                </div>
                <div className="flex gap-4 justify-center">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={resetErrorBoundary}
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="tertiary"
                        size="md"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback;
