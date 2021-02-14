import React from 'react'
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this. state = {
      error: '',
      errorInfo: '',
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    this.setState({ error });
  }

  render() {
    const { hasError, errorInfo, error } = this.state;
    if (hasError) {
      return (
        <div className="card my-5">
          <div className="card-header">
            <h1>There was an error loading this page.</h1>
            <p>
              <span
                style={{ cursor: 'pointer', color: '#0077FF' }}
                onClick={() => {
                  this.setState({hasError: false})
                }}
              >
                Try Again
              </span>
              <br/>
              If this Error persists. Please contact admin
            </p>
          </div>
          <div className="card-body">
            <details className="error-details">
              <summary>Click for error details</summary>
              <h2>Error Message:</h2>
              {error && error.message}
              <br/>
              <h2>Stack</h2>
              {errorInfo && errorInfo.componentStack.toString()}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}