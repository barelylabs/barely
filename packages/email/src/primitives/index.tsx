import type { ColumnProps } from '@react-email/components';
import { Body as BodyPrimitive } from '@react-email/body';
import { Button as ButtonPrimitive } from '@react-email/button';
import { Column, Row, Text } from '@react-email/components';
import { Container as ContainerPrimitive } from '@react-email/container';
import { Heading as HeadingPrimitive } from '@react-email/heading';
import { Hr as HrPrimitive } from '@react-email/hr';
import { Link as LinkPrimitive } from '@react-email/link';

import { cn } from '../cn';

export const resetText = {
	margin: '0',
	padding: '0',
	lineHeight: 1.4,
};

export {
	CodeBlock as EmailCodeBlock,
	CodeInline as EmailCodeInline,
	Column,
	Img as EmailImg,
	Markdown as EmailMarkdown,
	Row as EmailRow,
	Section as EmailSection,
} from '@react-email/components';
export { Html } from '@react-email/html';

export { Preview } from '@react-email/preview';
export { Text as EmailText } from '@react-email/text';
export { Head } from '@react-email/head';

export function Body(props: { children: React.ReactNode }) {
	const style = {
		fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
		backgroundColor: '#ffffff',
	};

	return <BodyPrimitive style={style}>{props.children}</BodyPrimitive>;
}

export function EmailColumn(props: ColumnProps & { tableCell?: boolean }) {
	const style = {
		...(props.tableCell && { display: 'table-cell' }),
	};
	return <div style={style}>{props.children}</div>;
}

export function EmailButton(props: { children: React.ReactNode; href: string }) {
	const style = {
		borderRadius: '6px',
		fontWeight: 600,
		backgroundColor: '#0f172a',
		color: '#ffffff',
		display: 'block',
		textAlign: 'center' as const,
		paddingTop: '11px',
		paddingBottom: '11px',
		paddingLeft: '23px',
		paddingRight: '23px',
	};

	return (
		<ButtonPrimitive href={props.href} style={style}>
			{props.children}
		</ButtonPrimitive>
	);
}

export function EmailContainer(props: { children: React.ReactNode }) {
	const style = {
		display: 'flex',
		paddingLeft: '1.25rem',
		paddingRight: '1.25rem',
		marginTop: '1.25rem',
		flexDirection: 'column' as const,
		width: '100%',
		maxWidth: '36rem',
	};

	return <ContainerPrimitive style={style}>{props.children}</ContainerPrimitive>;
}

export function EmailHeading(props: { children: React.ReactNode }) {
	const style = {
		marginTop: '1.5rem',
		marginBottom: '1.5rem',
		fontSize: '1.875rem',
		lineHeight: '2.25rem',
	};

	return <HeadingPrimitive style={style}>{props.children}</HeadingPrimitive>;
}

export function EmailLink(props: { children: React.ReactNode; href: string }) {
	const style = {
		color: '#3182ce',
	};

	return (
		<LinkPrimitive href={props.href} style={style} target='_blank'>
			{props.children}
		</LinkPrimitive>
	);
}

export function EmailSeparator() {
	return (
		<HrPrimitive
			style={{
				marginTop: '1.25rem',
				marginBottom: '1.25rem',
				borderWidth: '1px',
				width: '100%',
			}}
		/>
	);
}

export function EmailQuote(props: { children: React.ReactNode }) {
	const style = {
		display: 'inline-block',
		padding: '10px 4.5%',
		width: '90.5%',
		backgroundColor: '#f4f4f4',
		borderRadius: '6px',
		border: '1px solid #eee',
		color: '#333',
		fontStyle: 'italic',
	};

	return <div style={style}>- {props.children}</div>;
}

export function InformationTableLabel(props: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Text
			style={resetText}
			className={cn('text-xs font-normal text-slate-500', props.className)}
		>
			{props.children}
		</Text>
	);
}

export function InformationTableValue(props: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Text style={resetText} className={cn('text-sm text-slate-800', props.className)}>
			{props.children}
		</Text>
	);
}

export const informationTableColumn = {
	padding: '20px',
	borderStyle: 'solid',
	borderColor: 'white',
	borderWidth: '0px 1px 1px 0px',
	height: '44px',
};

export function InformationTableColumn(props: { children: React.ReactNode }) {
	return (
		<Column style={informationTableColumn} className={cn('align-top')}>
			{props.children}
		</Column>
	);
}

export const informationTableRow = {
	height: 'fit-content',
	paddingTop: '4px',
	paddingBottom: '4px',
	alignItems: 'top',
};

export function InformationTableRow(props: { children: React.ReactNode }) {
	return <Row style={informationTableRow}>{props.children}</Row>;
}
