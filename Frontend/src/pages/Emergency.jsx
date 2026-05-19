import React, { lazy, Suspense } from 'react';

const CrisisPage = lazy(() => import('./public/CrisisPage.jsx'));

export default function EmergencyWrapper(props) {
	return (
		<Suspense fallback={null}>
			<CrisisPage {...props} />
		</Suspense>
	);
}