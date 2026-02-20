import { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import ErrorFallback from "./ErrorFallback";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Send crash report to Sentry
        Sentry.captureException(error, { extra: errorInfo as any });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError && this.state.error) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    resetErrorBoundary={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
