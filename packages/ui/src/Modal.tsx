import { Dialog, Transition } from '@headlessui/react';
import { Dispatch, Fragment, SetStateAction } from 'react';

type ModalProps = {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	children: React.ReactNode;
};

export const Modal = ({ open, setOpen, children }: ModalProps) => {
	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog as='div' className='relative z-10' onClose={setOpen}>
				<Transition.Child
					as={Fragment}
					enter='ease-out duration-500'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'>
					<div className='fixed inset-0 transition-opacity bg-gray-900 bg-opacity-90' />
				</Transition.Child>
				<Dialog.Panel className='relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform rounded-lg shadow-xl bg-gray-50 white sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
					{children}
				</Dialog.Panel>
				<div className='fixed inset-0 z-10 overflow-y-auto'>
					<div className='flex items-center justify-center min-h-full p-4 text-center align-middle sm:items-center sm:p-0'>
						<Transition.Child
							as={Fragment}
							enter='ease-out duration-600'
							enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
							enterTo='opacity-100 translate-y-0 sm:scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 translate-y-0 sm:scale-100'
							leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'>
							<Dialog.Panel className='relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform rounded-lg shadow-xl bg-gray-50 white sm:my-8 sm:w-full sm:max-w-lg sm:p-6'></Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
};
