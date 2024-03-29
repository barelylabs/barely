export const main = {
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
	backgroundColor: '#ffffff',
};

export const container = {
	margin: '0 auto',
	padding: '20px 20px 48px',
	width: '660px',
	maxWidth: '100%',
};

export const resetText = {
	margin: '0',
	padding: '0',
	lineHeight: 1.4,
};

export const mutedText = {
	color: '#64748b',
};

export const button = {
	borderRadius: '0.375rem', // 0.37
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

export const outlineButton = {
	...button,
	backgroundColor: 'transparent',
	fontWeight: 400,
	color: '#64748b',
	border: '1px solid #64748b',
};

export const tableCell = {
	display: 'table-cell',
};

export const heading = {
	marginTop: '1.5rem',
	marginBottom: '1.5rem',
	fontSize: '1.875rem',
	lineHeight: '2.25rem',
};

export const informationTable = {
	borderCollapse: 'collapse' as const,
	borderSpacing: '0px',
	color: 'rgb(51,51,51)',
	backgroundColor: 'rgb(250,250,250)',
	borderRadius: '6px',
	fontSize: '12px',
};

export const informationTableRow = {
	height: '46px',
};

export const informationTableColumn = {
	padding: '20px',
	borderStyle: 'solid',
	borderColor: 'white',
	borderWidth: '0px 1px 1px 0px',
	height: '44px',
};

export const informationTableLabel = {
	...resetText,
	color: 'rgb(102,102,102)',
	fontSize: '10px',
};

export const informationTableValue = {
	fontSize: '12px',
	margin: '0',
	padding: '0',
	lineHeight: 1.4,
};
