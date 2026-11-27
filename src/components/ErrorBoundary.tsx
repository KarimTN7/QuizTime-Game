import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'Unexpected application error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0D19] text-[#F5F5FA] p-6">
          <div className="max-w-md w-full p-6 rounded-xl bg-[#12162A] border border-white/10 space-y-4 text-center">
            <h1 className="text-xl font-bold">حدث خطأ غير متوقع · Unexpected Error</h1>
            <p className="text-sm text-[#9399B2] break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-[#8057FF] text-white text-sm font-bold"
            >
              إعادة تحميل الصفحة · Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
