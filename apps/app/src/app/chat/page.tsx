'use client';

import { useState } from 'react';
import { trpc } from '../../client/trpcClient';

import { Button } from '@barely/ui/src/Button';
import { TextArea } from '@barely/ui/src/TextArea';

export default function ChatGPTPage() {
	const chatId = 1;

	const currentUserId = 'adambarito';
	const currentChatId = 1;

	const messages = [
		{
			id: 1,
			chatId: 1,
			message: 'Hello world',
			createdAt: new Date(),
			sentBy: 'adambarito',
			sentTo: 'barely.ai',
		},
		{
			id: 2,
			chatId: 1,
			message: 'Hello yourself.',
			createdAt: new Date(),
			sentBy: 'barely.ai',
			sentTo: 'adambarito',
		},
		{
			id: 3,
			chatId: 1,
			message: 'Hello yourself.',
			createdAt: new Date(),
			sentBy: 'barely.ai',
			sentTo: 'adambarito',
		},
	];

	const [prompt, setPrompt] = useState<string>('Say this is a test.');
	const [message, setMessage] = useState<string>('');

	const sendPrompt = trpc.ai.sendPrompt.useMutation({
		onSuccess: data => {
			console.log('message => ', data.message);
			setMessage(data.message ?? 'undefined');
		},
	});

	const handleSendPrompt = () => {
		console.log('prompt => ', prompt);
		sendPrompt.mutate({ prompt: 'say this is a test.' });
	};

	return (
		<div className='flex h-[100%] flex-row'>
			<div className='flex h-full min-w-[250px] flex-1 flex-col justify-items-start bg-gray-900 p-5'>
				<div>
					<div className='flex flex-1 flex-col text-gray-100'>barely.chat</div>
					<Button className='w-full bg-spotify-200' onClick={() => handleSendPrompt()}>
						New chat
					</Button>
				</div>
			</div>

			<div className='flex min-h-max w-full flex-col bg-tiktok-200 p-5'>
				<div className='mb-5 grow rounded-md bg-tiktok-300'>
					<h1>This is a pink thing.</h1>
					<div
						id='chat-history'
						className='h-max min-h-max grow flex-col bg-gray-800 text-white'
					>
						message: {message}
					</div>
				</div>
				<TextArea />
				<Button
					className='mt-2 w-full rounded-md bg-tiktok-600 p-3  text-white'
					onClick={() => handleSendPrompt()}
				>
					Send
				</Button>
			</div>
		</div>
	);
}
