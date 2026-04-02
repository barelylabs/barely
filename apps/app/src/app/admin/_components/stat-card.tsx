import { Card } from '@barely/ui/card';
import { Text } from '@barely/ui/typography';

export function StatCard({
	label,
	value,
	description,
}: {
	label: string;
	value: string | number;
	description?: string;
}) {
	return (
		<Card className='flex flex-col gap-1 p-4'>
			<Text variant='sm/medium' className='text-muted-foreground'>
				{label}
			</Text>
			<Text variant='2xl/bold'>{value}</Text>
			{description && (
				<Text variant='xs/normal' className='text-muted-foreground'>
					{description}
				</Text>
			)}
		</Card>
	);
}
