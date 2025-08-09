'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class VipAudioPlayerErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log the error to the console for debugging
		console.error('VipAudioPlayer Error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// Render custom fallback UI or provided fallback
			return (
				this.props.fallback ?? (
					<div className='rounded-lg border border-border/50 bg-muted/20 p-6 text-center'>
						<div className='mb-2 text-sm font-medium text-muted-foreground'>
							Audio Player Unavailable
						</div>
						<div className='text-xs text-muted-foreground'>
							There was an error loading the audio player. The download link will still
							work.
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
