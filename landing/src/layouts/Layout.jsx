import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow mx-auto max-w-7xl mx-auto">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
export default Layout;