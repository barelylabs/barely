import type { Transformer } from '@lexical/markdown';
import { useEffect, useState } from 'react';
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';

import type { TextEditorProps } from '../editor';

type MarkdownInOutPluginProps = Pick<TextEditorProps, 'updateTemplate'> & {
	getMarkdown: () => string;
	setMarkdown: (text: string) => void;
	transformers: Transformer[];
};

export function MarkdownInOutPlugin(props: MarkdownInOutPluginProps) {
	const [editor] = useLexicalComposerContext();
	const [firstRender, setFirstRender] = useState(true);

	useEffect(() => {
		if (firstRender) {
			setFirstRender(false);
			return;
		}
		editor.update(() => {
			const root = $getRoot();
			if (root) {
				editor.update(() => {
					$convertFromMarkdownString(props.getMarkdown(), props.transformers);
				});
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.updateTemplate]);

	useEffect(() => {
		editor.update(() => {
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					const mkd = $convertToMarkdownString(props.transformers);
					props.setMarkdown(mkd);
				});
			});
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
}
