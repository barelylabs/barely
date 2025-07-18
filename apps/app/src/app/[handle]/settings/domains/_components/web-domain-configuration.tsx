import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { DomainStatus } from '@barely/validators';
import { useState } from 'react';
import { getSubdomain } from '@barely/utils';

export function DomainConfiguration(props: {
	status: DomainStatus;
	domainResponse: AppRouterOutputs['webDomain']['verifyOnVercel']['vercelDomainResponse'];
	configResponse: AppRouterOutputs['webDomain']['verifyOnVercel']['vercelConfigResponse'];
}) {
	const { status, domainResponse, configResponse } = props;

	const subdomain =
		domainResponse.success && domainResponse.parsed ?
			getSubdomain(domainResponse.data.name, domainResponse.data.apexName)
		:	null;

	const [recordType, setRecordType] = useState<'A' | 'CNAME'>(subdomain ? 'CNAME' : 'A'); // default to CNAME if this is a subdomain, but the user can change it to A if they want

	if (status === 'Unknown Error') {
		return (
			<div className='border-t border-gray-200 pt-5'>
				{!domainResponse.success && domainResponse.parsed && (
					<p className='mb-5 text-sm'>{domainResponse.data.error.message}</p>
				)}
			</div>
		);
	}

	if (
		!domainResponse.success ||
		!domainResponse.parsed ||
		!configResponse.success ||
		!configResponse.parsed
	)
		return <p>Unknown Error</p>; //fixme - handle error/non-parsed states better

	const domainJson = domainResponse.data;
	const configJson = configResponse.data;

	if (status === 'Pending Verification') {
		const txtVerification = domainResponse.data.verification?.find(v => v.type === 'TXT');

		if (!txtVerification) return null; //fixme - handle error/non-parsed states better

		return (
			<div className='border-t border-gray-200'>
				<DnsRecord
					instructions={`Please set the following TXT record on <code>${domainJson.apexName}</code> to prove ownership of <code>${domainJson.name}</code>:`}
					records={[
						{
							type: txtVerification.type,
							name: txtVerification.domain.slice(
								0,
								txtVerification.domain.length - domainJson.apexName.length - 1,
							),
							value: txtVerification.value,
						},
					]}
					warning='Warning: if you are using this domain for another site, setting this TXT record will transfer domain ownership away from that site and break it. Please exercise caution when setting this record.'
				/>
			</div>
		);
	}

	if (status === 'Conflicting DNS Records') {
		return (
			<div className='border-t border-gray-200 pt-5'>
				<div className='flex justify-start space-x-4'>
					<div className='ease border-b-2 border-black pb-1 text-sm text-black transition-all duration-150'>
						{configJson.conflicts.some(x => x.type === 'A') ?
							'A Record (recommended)'
						:	'CNAME Record (recommended)'}
					</div>
				</div>
				<DnsRecord
					instructions='Please remove the following conflicting DNS records from your DNS provider:'
					records={configJson.conflicts.map(
						({ name, type, value }: { name: string; type: string; value: string }) => ({
							name,
							type,
							value,
						}),
					)}
				/>
				<DnsRecord
					instructions='Afterwards, set the following record on your DNS provider to continue:'
					records={[
						{
							type: recordType,
							name: recordType === 'A' ? '@' : (subdomain ?? 'www'),
							value: recordType === 'A' ? `76.76.21.21` : `cname.barely.link`,
							ttl: '86400',
						},
					]}
				/>
			</div>
		);
	}

	return (
		<div className='border-t border-gray-200 pt-5'>
			<div className='flex justify-start space-x-4'>
				<button
					onClick={() => setRecordType('A')}
					className={`${
						recordType == 'A' ? 'border-black text-black' : 'border-white text-gray-400'
					} ease border-b-2 pb-1 text-sm transition-all duration-150`}
				>
					A Record{!subdomain && ' (recommended)'}
				</button>
				<button
					onClick={() => setRecordType('CNAME')}
					className={`${
						recordType == 'CNAME' ?
							'border-black text-black'
						:	'border-white text-gray-400'
					} ease border-b-2 pb-1 text-sm transition-all duration-150`}
				>
					CNAME Record{subdomain && ' (recommended)'}
				</button>
			</div>

			<DnsRecord
				instructions={`To configure your ${
					recordType === 'A' ? 'apex domain' : 'subdomain'
				} <code>${
					recordType === 'A' ? domainJson.apexName : domainJson.name
				}</code>, set the following ${recordType} record on your DNS provider to
              continue:`}
				records={[
					{
						type: recordType,
						name: recordType === 'A' ? '@' : (subdomain ?? 'www'),
						value: recordType === 'A' ? `76.76.21.21` : `cname.barely.link`,
						ttl: '86400',
					},
				]}
			/>
		</div>
	);
}

const MarkdownText = ({ text }: { text: string }) => {
	return (
		<p
			className='prose-sm my-5 max-w-none prose-code:rounded-md prose-code:bg-blue-100 prose-code:p-1 prose-code:font-mono prose-code:text-[14px] prose-code:font-medium prose-code:text-blue-900'
			dangerouslySetInnerHTML={{ __html: text }}
		/>
	);
};

const DnsRecord = ({
	instructions,
	records,
	warning,
}: {
	instructions: string;
	records: { type: string; name: string; value: string; ttl?: string }[];
	warning?: string;
}) => {
	const hasTtl = records.some(x => x.ttl);
	return (
		<div className='my-3 text-left'>
			<MarkdownText text={instructions} />
			<div className='flex items-center justify-start space-x-10 rounded-md bg-gray-50 p-2'>
				<div>
					<p className='text-sm font-bold'>Type</p>
					{records.map(record => (
						<p key={record.type} className='mt-2 font-mono text-sm'>
							{record.type}
						</p>
					))}
				</div>
				<div>
					<p className='text-sm font-bold'>Name</p>
					{records.map(record => (
						<p key={record.name} className='mt-2 font-mono text-sm'>
							{record.name}
						</p>
					))}
				</div>
				<div>
					<p className='text-sm font-bold'>Value</p>
					{records.map(record => (
						<p key={record.value} className='mt-2 font-mono text-sm'>
							{record.value}
						</p>
					))}
				</div>
				{hasTtl && (
					<div>
						<p className='text-sm font-bold'>TTL</p>
						{records.map(record => (
							<p key={record.ttl} className='mt-2 font-mono text-sm'>
								{record.ttl}
							</p>
						))}
					</div>
				)}
			</div>
			{(warning ?? hasTtl) && (
				<MarkdownText
					text={
						warning ??
						'Note: for TTL, if <code>86400</code> is not available, set the highest value possible. Also, domain propagation can take anywhere between 1 hour to 12 hours.'
					}
				/>
			)}
		</div>
	);
};
