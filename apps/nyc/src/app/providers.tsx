'use client';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@barely/ui/next-theme-provider';

import { ContactModalProvider } from '../contexts/contact-modal-context';
import { FormDataProvider } from '../contexts/form-data-context';

export default function Providers(props: { children: ReactNode; headers?: Headers }) {
	return (
		<ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
			<FormDataProvider>
				<ContactModalProvider>
					<>{props.children}</>
				</ContactModalProvider>
			</FormDataProvider>
		</ThemeProvider>
	);
}
