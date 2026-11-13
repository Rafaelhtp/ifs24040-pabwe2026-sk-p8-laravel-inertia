import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

import PublicPostIndex from './Pages/Public/PostIndex.jsx';
import AuthLogin from './Pages/Auth/Login.jsx';
import AuthRegister from './Pages/Auth/Register.jsx';
import PostIndex from './Pages/Post/Index.jsx';
import PostShow from './Pages/Post/Show.jsx';
import ProfileEdit from './Pages/Profile/Edit.jsx';

const eagerPages = {
    'Public/PostIndex': PublicPostIndex,
    'Auth/Login': AuthLogin,
    'Auth/Register': AuthRegister,
    'Post/Index': PostIndex,
    'Post/Show': PostShow,
    'Profile/Edit': ProfileEdit,
};

const lazyPages = {
    'Public/PostShow': () => import('./Pages/Public/PostShow.jsx'),
    'Admin/UserList': () => import('./Pages/Admin/UserList.jsx'),
    'Admin/PostList': () => import('./Pages/Admin/PostList.jsx'),
    'Admin/UserPostList': () => import('./Pages/Admin/UserPostList.jsx'),
};

const appName = import.meta.env.VITE_APP_NAME || 'BlogVerse Pro';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        if (eagerPages[name]) {
            return eagerPages[name];
        }
        if (lazyPages[name]) {
            return lazyPages[name]();
        }
        throw new Error(`Page ${name} not found`);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4338ca',
    },
});
