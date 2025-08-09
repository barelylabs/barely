'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

interface AuthWrapperProps {
	children: React.ReactNode;
	isAuthenticated: boolean;
	redirectUrl?: string;
}

export function AuthWrapper({
	children,
	isAuthenticated,
	redirectUrl = '/login',
}: AuthWrapperProps) {
	useEffect(() => {
		if (!isAuthenticated) {
			redirect(redirectUrl);
		}
	}, [isAuthenticated, redirectUrl]);

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
