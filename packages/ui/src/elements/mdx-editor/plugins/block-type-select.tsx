import type { HeadingTagType } from '@lexical/rich-text';
import type { BlockType } from '@mdxeditor/editor';
import React from 'react';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import {
	activePlugins$,
	allowedHeadingLevels$,
	convertSelectionToNode$,
	currentBlockType$,
	useTranslation,
} from '@mdxeditor/editor';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import { $createParagraphNode } from 'lexical';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../select';

/**
 * A toolbar component that allows the user to change the block type of the current selection.
 * Supports paragraphs, headings and block quotes.
 * @group Toolbar Components
 */
export const BlockTypeSelect = () => {
	const convertSelectionToNode = usePublisher(convertSelectionToNode$);
	const currentBlockType = useCellValue(currentBlockType$);
	const activePlugins = useCellValue(activePlugins$);
	const hasQuote = activePlugins.includes('quote');
	const hasHeadings = activePlugins.includes('headings');
	const t = useTranslation();

	if (!hasQuote && !hasHeadings) {
		return null;
	}
	const items: { label: string | React.JSX.Element; value: BlockType }[] = [
		{ label: t('toolbar.blockTypes.paragraph', 'Paragraph'), value: 'paragraph' },
	];

	if (hasQuote) {
		items.push({ label: t('toolbar.blockTypes.quote', 'Quote'), value: 'quote' });
	}

	if (hasHeadings) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const allowedHeadingLevels = useCellValue(allowedHeadingLevels$);
		items.push(
			...allowedHeadingLevels.map(
				n =>
					({
						label: t('toolbar.blockTypes.heading', 'Heading {{level}}', { level: n }),
						value: `h${n}`,
					}) as const,
			),
		);
	}

	return (
		<Select
			value={currentBlockType}
			onValueChange={blockType => {
				switch (blockType) {
					case 'quote':
						convertSelectionToNode(() => $createQuoteNode());
						break;
					case 'paragraph':
						convertSelectionToNode(() => $createParagraphNode());
						break;
					case '':
						break;
					default:
						if (blockType.startsWith('h')) {
							convertSelectionToNode(() =>
								$createHeadingNode(blockType as HeadingTagType),
							);
						} else {
							throw new Error(`Unknown block type: ${blockType}`);
						}
				}
			}}
		>
			<SelectTrigger className='h-[32px] w-[180px]'>
				<SelectValue />
			</SelectTrigger>

			<SelectContent>
				{items.map(({ label, value }) => (
					<SelectItem key={value} value={value}>
						{label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>

		// <Select
		// 	value={currentBlockType}
		// 	onChange={blockType => {
		// 		switch (blockType) {
		// 			case 'quote':
		// 				convertSelectionToNode(() => $createQuoteNode());
		// 				break;
		// 			case 'paragraph':
		// 				convertSelectionToNode(() => $createParagraphNode());
		// 				break;
		// 			case '':
		// 				break;
		// 			default:
		// 				if (blockType.startsWith('h')) {
		// 					convertSelectionToNode(() => $createHeadingNode(blockType));
		// 				} else {
		// 					throw new Error(`Unknown block type: ${blockType}`);
		// 				}
		// 		}
		// 	}}
		// 	triggerTitle={t(
		// 		'toolbar.blockTypeSelect.selectBlockTypeTooltip',
		// 		'Select block type',
		// 	)}
		// 	placeholder={t('toolbar.blockTypeSelect.placeholder', 'Block type')}
		// 	items={items}
		// />
	);
};
