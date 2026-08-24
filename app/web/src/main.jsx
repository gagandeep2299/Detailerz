import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { BucketProvider } from './contexts/BucketContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	<AuthProvider>
		<BucketProvider>
			<App />
		</BucketProvider>
	</AuthProvider>
);
