import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: '#1a1a2e',
                    color: '#fff',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        marginBottom: '1rem',
                        fontFamily: 'var(--font-holocene, sans-serif)'
                    }}>
                        Oops ! Une erreur est survenue
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        marginBottom: '2rem',
                        opacity: 0.8,
                        maxWidth: '500px'
                    }}>
                        Nous sommes desoles pour ce desagrement.
                        Veuillez recharger la page ou revenir plus tard.
                    </p>
                    <button
                        onClick={this.handleReload}
                        style={{
                            background: '#7c3aed',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-holocene, sans-serif)',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        Recharger la page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
