import type { LexicalCommand } from 'lexical';
import React from 'react';
import { useZodForm } from '@barely/hooks';
import {
	activeEditor$,
	cancelLinkEdit$,
	Cell,
	editorRootElementRef$,
	iconComponentFor$,
	linkDialogState$,
	onWindowChange$,
	removeLink$,
	switchFromPreviewToLinkEdit$,
	updateLink$,
	useTranslation,
} from '@mdxeditor/editor';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
import * as TooltipOld from '@radix-ui/react-tooltip';
import classNames from 'classnames';
import { createCommand } from 'lexical';
import { z } from 'zod/v4';

import { Form, SubmitButton } from '../../../../forms/form';
import { TextField } from '../../../../forms/text-field';
import { Button } from '../../../button';
import { Popover, PopoverAnchor, PopoverContent } from '../../../popover';
import { Text } from '../../../typography';

// import styles from '../../styles/ui.module.css';

export const OPEN_LINK_DIALOG: LexicalCommand<undefined> = createCommand();

export type ClickLinkCallback = (url: string) => void;

/** @internal */
export const onClickLinkCallback$ = Cell<ClickLinkCallback | null>(null);

interface LinkEditFormProps {
	url: string;
	title: string;
	onSubmit: (link: { url: string; title: string }) => void;
	onCancel: () => void;
	linkAutocompleteSuggestions: string[];
}

export function LinkEditForm({ url, title, onSubmit, onCancel }: LinkEditFormProps) {
	const form = useZodForm({
		schema: z.object({
			url: z.string().url(),
			title: z.string(),
		}),
		values: {
			url,
			title,
		},
	});

	return (
		<Form form={form} onSubmit={onSubmit}>
			<div className='flex min-w-96 flex-col gap-2'>
				{}
				<TextField name='url' label='URL' autoFocus />
				<TextField name='title' label='Title' />
				<div className='flex flex-row justify-end gap-2'>
					<SubmitButton>Save</SubmitButton>
					<Button look='secondary' onClick={onCancel}>
						Cancel
					</Button>
				</div>
			</div>
		</Form>
	);
}

/** @internal */
export const LinkDialog: React.FC = () => {
	const [editorRootElementRef, activeEditor, iconComponentFor, linkDialogState] =
		useCellValues(
			editorRootElementRef$,
			activeEditor$,
			iconComponentFor$,
			linkDialogState$,
		);
	const publishWindowChange = usePublisher(onWindowChange$);
	const updateLink = usePublisher(updateLink$);
	const cancelLinkEdit = usePublisher(cancelLinkEdit$);
	const switchFromPreviewToLinkEdit = usePublisher(switchFromPreviewToLinkEdit$);
	const removeLink = usePublisher(removeLink$);

	React.useEffect(() => {
		const update = () => {
			activeEditor?.getEditorState().read(() => {
				publishWindowChange(true);
			});
		};

		window.addEventListener('resize', update);
		window.addEventListener('scroll', update);

		return () => {
			window.removeEventListener('resize', update);
			window.removeEventListener('scroll', update);
		};
	}, [activeEditor, publishWindowChange]);

	const [copyUrlTooltipOpen, setCopyUrlTooltipOpen] = React.useState(false);

	const t = useTranslation();

	const theRect = linkDialogState.rectangle;

	const urlIsExternal =
		linkDialogState.type === 'preview' && linkDialogState.url.startsWith('http');

	return (
		<Popover open={linkDialogState.type !== 'inactive'}>
			<PopoverAnchor
				data-visible={linkDialogState.type === 'edit'}
				// className={styles.linkDialogAnchor}
				style={{
					top: `${theRect?.top ?? 0}px`,
					left: `${theRect?.left ?? 0}px`,
					width: `${theRect?.width ?? 0}px`,
					height: `${theRect?.height ?? 0}px`,
				}}
			/>

			<PopoverContent
				className={'w-fit p-2'}
				sideOffset={5}
				onOpenAutoFocus={e => {
					e.preventDefault();
				}}
				key={linkDialogState.linkNodeKey}
			>
				{linkDialogState.type === 'edit' && (
					<LinkEditForm
						url={linkDialogState.url}
						title={linkDialogState.title}
						onSubmit={updateLink}
						onCancel={cancelLinkEdit.bind(null)}
						linkAutocompleteSuggestions={[]}
					/>
				)}

				{linkDialogState.type === 'preview' && (
					<div className='flex flex-row items-center gap-2'>
						<Button
							href={linkDialogState.url}
							title={
								urlIsExternal ?
									t('linkPreview.open', `Open {{url}} in new window`, {
										url: linkDialogState.url,
									})
								:	linkDialogState.url
							}
							target='_blank'
							rel='noreferrer'
							look='link'
						>
							<Text variant='sm/normal'>{linkDialogState.url}</Text>
						</Button>

						<div className='flex flex-row gap-[2px]'>
							<ActionButton
								onClick={() => switchFromPreviewToLinkEdit()}
								title={t('linkPreview.edit', 'Edit link URL')}
								aria-label={t('linkPreview.edit', 'Edit link URL')}
							>
								{iconComponentFor('edit')}
							</ActionButton>
							<TooltipOld.Provider>
								<TooltipOld.Root open={copyUrlTooltipOpen}>
									<TooltipOld.Trigger asChild>
										<ActionButton
											title={t('linkPreview.copyToClipboard', 'Copy to clipboard')}
											aria-label={t('linkPreview.copyToClipboard', 'Copy to clipboard')}
											onClick={() => {
												void window.navigator.clipboard
													.writeText(linkDialogState.url)
													.then(() => {
														setCopyUrlTooltipOpen(true);
														setTimeout(() => {
															setCopyUrlTooltipOpen(false);
														}, 1000);
													});
											}}
										>
											{copyUrlTooltipOpen ?
												iconComponentFor('check')
											:	iconComponentFor('content_copy')}
										</ActionButton>
									</TooltipOld.Trigger>
									<TooltipOld.Portal container={editorRootElementRef?.current}>
										<TooltipOld.Content
											// className={classNames(styles.tooltipContent)}
											sideOffset={5}
										>
											{t('linkPreview.copied', 'Copied!')}
											<TooltipOld.Arrow />
										</TooltipOld.Content>
									</TooltipOld.Portal>
								</TooltipOld.Root>
							</TooltipOld.Provider>

							<ActionButton
								title={t('linkPreview.remove', 'Remove link')}
								aria-label={t('linkPreview.remove', 'Remove link')}
								onClick={() => {
									removeLink();
								}}
							>
								{iconComponentFor('link_off')}
							</ActionButton>
						</div>
					</div>
				)}
			</PopoverContent>
			{/* </PopoverOld.Content>
			</PopoverOld.Portal> */}
		</Popover>
	);
};

const ActionButton = React.forwardRef<
	HTMLButtonElement,
	React.ComponentPropsWithoutRef<'button'>
>(({ className, ...props }, ref) => {
	return (
		// <button className={classNames(styles.actionButton, className)} ref={ref} {...props} />
		<button className={classNames(className)} ref={ref} {...props} />
	);
});

ActionButton.displayName = 'ActionButton';
