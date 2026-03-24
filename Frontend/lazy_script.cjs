const fs = require('fs');

let code = fs.readFileSync('./src/routes/Routers.jsx', 'utf8');

// Do not lazy load essential base components for fast First Contentful Paint:
// Home, Login, Signup, Loading, ProtectedRoute, GoogleAuthRedirect
const DONT_LAZY_LOAD = [
    'React', 
    'Routes', 
    'Route', 
    'ProtectedRoute', 
    'GoogleAuthRedirect',
    'Home',         // Critical for initial load perception
    'Login',        // Frequently accessed immediately
    'Signup'
];

code = code.replace(/import ([A-Za-z0-9_]+) from '([^']+)';/g, (match, name, path) => {
    // If it's a structural import or designated synchronous, keep it intact
    if (DONT_LAZY_LOAD.includes(name) || !path.startsWith('..')) {
        return match;
    }
    
    // Otherwise lazy load it
    return `const ${name} = React.lazy(() => import('${path}'));`;
});

// Import suspense and loader if not present
if(!code.includes('import Loading')) {
    code = code.replace(/import React from 'react'/, `import React, { Suspense } from 'react';\nimport Loading from '../components/Loader/Loading';`);
}

// Wrap <Routes> with <Suspense>
code = code.replace(/<Routes>/, `<Suspense fallback={<Loading />}><Routes>`);
code = code.replace(/<\/Routes>/, `</Routes></Suspense>`);

fs.writeFileSync('./src/routes/Routers.jsx', code);
console.log('Routers.jsx converted to React.lazy successfully.');
