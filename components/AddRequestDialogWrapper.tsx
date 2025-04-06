import dynamic from 'next/dynamic';

const AddRequestDialog = dynamic(() => import('./AddRequestDialog'), { ssr: false });

export default AddRequestDialog;