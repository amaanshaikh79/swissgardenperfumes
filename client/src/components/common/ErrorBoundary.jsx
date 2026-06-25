import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Wire to monitoring later if added
        console.error('Render error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    role="alert"
                    style={{
                        minHeight: '60vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '2rem',
                        gap: '1rem',
                    }}
                >
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Something went wrong</h1>
                    <p style={{ color: '#666', maxWidth: '420px' }}>
                        We hit an unexpected error. Please reload the page or return home.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Reload
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => window.location.assign('/')}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
