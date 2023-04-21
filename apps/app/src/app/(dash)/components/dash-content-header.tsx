import { H1 } from '@barely/ui/elements';

interface DashContentHeaderProps {
	title: string;
}

const DashContentHeader = (props: DashContentHeaderProps) => {
	return <H1>{props.title}</H1>;
};

export { DashContentHeader };
