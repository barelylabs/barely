'use client';

import type { JsxComponentDescriptor, JsxEditorProps } from '@mdxeditor/editor';
import type { LexicalEditor } from 'lexical';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import type { z } from 'zod/v4';
import { useMemo, useState } from 'react';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { mdxGridSchema } from '@barely/lib/server/mdx/mdx.schema';
import {
	insertJsx$,
	NestedLexicalEditor,
	Button as ToolbarButton,
	useMdastNodeUpdater,
	useNestedEditorContext,
	usePublisher,
} from '@mdxeditor/editor';
import {
	$getRoot,
	$getSelection,
	$isParagraphNode,
	$isRangeSelection,
	COMMAND_PRIORITY_CRITICAL,
	DELETE_CHARACTER_COMMAND,
	KEY_BACKSPACE_COMMAND,
} from 'lexical';

import { Form, SubmitButton } from '../../../forms';
import { SelectField } from '../../../forms/select-field';
import { ToggleField } from '../../../forms/toggle-field';
import { Button } from '../../button';
import { Icon } from '../../icon';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';

export const mdxGridPlugin: JsxComponentDescriptor[] = [
	{
		name: 'Card',
		kind: 'flow',
		props: [],
		hasChildren: true,
		Editor: () => {
			return (
				<div className='my-4 rounded-md border border-blue px-4'>
					<NestedLexicalEditor<MdxJsxFlowElement>
						block
						getContent={node => {
							return node.children;
						}}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						getUpdatedMdastNode={(mdastNode, children: any) => ({
							...mdastNode,
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							children,
						})}
					/>
				</div>
			);
		},
	},
	{
		name: 'Grid',
		kind: 'flow',
		props: [
			{
				name: 'reverseOnMobile',
				type: 'string',
			},
			{
				name: 'growColumn',
				type: 'string',
			},
		],
		hasChildren: true,
		Editor: props => {
			const { parentEditor } = useNestedEditorContext();

			parentEditor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				onBackspace,
				COMMAND_PRIORITY_CRITICAL,
			);

			parentEditor.registerCommand(
				DELETE_CHARACTER_COMMAND,
				onBackspace,
				COMMAND_PRIORITY_CRITICAL,
			);

			return (
				<div className='my-4 flex flex-col gap-4 rounded-md border border-red p-4'>
					<NestedLexicalEditor<MdxJsxFlowElement>
						block={true}
						getContent={node => {
							const children = node.children;
							if (children.at(-1)?.type !== 'paragraph') {
								children.push({ type: 'paragraph', children: [] });
							}
							return children;
						}}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						getUpdatedMdastNode={(mdastNode, children: any) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
							if (children.at?.(-1)?.type !== 'paragraph') {
								// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
								children.push({ type: 'paragraph', children: [] });
							}
							return {
								...mdastNode,
								// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
								children,
							};
						}}
					/>

					<GridEditor {...props} />

					{/* <div className='flex flex-row gap-4'>
						<Toggle
							pressed={reverse}
							onPressedChange={value => {
								console.log('typeof value', typeof value);
								console.log('value', value);
								console.log('value.toString()', value.toString());
								updateMdastNode({
									...mdastNode,
									attributes: [
										...mdastNode.attributes,
										{
											type: 'mdxJsxAttribute',
											name: 'reverse',
											value: reverse ? 'true' : 'false',
										},
									],
								});
							}}
						>
							{reverse ? 'Reverse' : 'Normal'}
							<Icon.swap className='h-5 w-5' />
						</Toggle>
					</div> */}
				</div>
			);
		},
	},
];

export const GridEditor: React.FC<JsxEditorProps> = ({ mdastNode }) => {
	const [showEditModal, setShowEditModal] = useState(false);

	const updateMdastNode = useMdastNodeUpdater();

	const properties = useMemo(() => {
		const reverseOnMobile = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'reverseOnMobile',
		)?.value;

		const growColumn = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'growColumn',
		)?.value;

		const GrowColumnIcon =
			growColumn === 'left' ? Icon.gridGrowLeft
			: growColumn === 'right' ? Icon.gridGrowRight
			: Icon.gridGrowNone;

		console.log('growColumn', growColumn, 'reverseOnMobile', reverseOnMobile);

		return {
			reverseOnMobile: typeof reverseOnMobile === 'string' ? reverseOnMobile : '',
			growColumn:
				typeof growColumn !== 'string' ? undefined : (
					(growColumn as 'left' | 'right' | 'none')
				),
			GrowColumnIcon,
		};
	}, [mdastNode]);

	const form = useZodForm({
		schema: mdxGridSchema,
		defaultValues: {
			reverseOnMobile: properties.reverseOnMobile === 'true',
			growColumn: properties.growColumn,
		},
	});

	const onSubmit = (values: z.infer<typeof mdxGridSchema>) => {
		const updatedAttributes = [
			{
				type: 'mdxJsxAttribute' as const,
				name: 'reverseOnMobile',
				value: values.reverseOnMobile ? 'true' : 'false',
			},
			{
				type: 'mdxJsxAttribute' as const,
				name: 'growColumn',
				value: values.growColumn ?? 'none',
			},
		];

		console.log('updatedAttributes', updatedAttributes);

		updateMdastNode({
			attributes: updatedAttributes,
		});
		setShowEditModal(false);
	};

	return (
		<div className='flex flex-row items-center justify-between gap-2 rounded-md bg-gray-100 px-3 py-2'>
			{/* <Icon.grid className='h-5 w-5' /> */}
			<div className='flex flex-row items-center gap-2'>
				<properties.GrowColumnIcon className='h-4 w-4' />
				{properties.reverseOnMobile === 'true' && <Icon.swap className='h-4 w-4' />}
			</div>
			<Popover open={showEditModal} onOpenChange={setShowEditModal}>
				<PopoverTrigger asChild>
					<Button size='sm' startIcon='settings' variant='icon' look='ghost' />
				</PopoverTrigger>
				<PopoverContent>
					<Form form={form} onSubmit={onSubmit} className='gap-2'>
						<SelectField
							options={[
								{ value: 'left', label: <Icon.gridGrowLeft className='h-5 w-5' /> },
								{ value: 'right', label: <Icon.gridGrowRight className='h-5 w-5' /> },
								{ value: 'none', label: <Icon.gridGrowNone className='h-5 w-5' /> },
							]}
							control={form.control}
							name='growColumn'
						/>
						<ToggleField control={form.control} name='reverseOnMobile'>
							<Icon.swap className='h-5 w-5' />
						</ToggleField>

						<SubmitButton>Save</SubmitButton>
					</Form>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export const InsertCard = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<div className='flex flex-row items-center justify-between gap-2 rounded-md px-2 py-2'>
			<ToolbarButton
				onClick={() =>
					insertJsx({
						name: 'Card',
						kind: 'flow',
						props: {},
					})
				}
			>
				<Icon.card className='h-5 w-5' />
			</ToolbarButton>
		</div>
	);
};

export const InsertGrid = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<>
			<ToolbarButton
				onClick={() =>
					insertJsx({
						name: 'Grid',
						kind: 'flow',
						props: {
							growColumn: 'none',
							reverseOnMobile: 'false',
						},
					})
				}
			>
				<Icon.grid className='h-5 w-5' />
			</ToolbarButton>
		</>
	);
};

const onBackspace = (ev: KeyboardEvent, editor: LexicalEditor) => {
	const selection = editor.getEditorState().read(() => $getSelection());

	if ($isRangeSelection(selection)) {
		const anchorNode = selection.anchor.getNode();
		const previousNodeIsParagraph =
			anchorNode.getPreviousSibling()?.__type === 'paragraph';
		const anchorNodeIsLastNode = editor.getEditorState().read(() => {
			const rootNode = $getRoot();
			const lastChild = rootNode.getLastChild();
			return anchorNode === lastChild;
		});

		if (
			$isParagraphNode(anchorNode) &&
			!previousNodeIsParagraph &&
			anchorNode.getTextContent().length === 0 &&
			selection.anchor.offset === 0 &&
			anchorNodeIsLastNode
		) {
			return true;
		}
	}

	return false;
};
