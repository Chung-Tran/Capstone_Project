import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import GlobalLoading from '../pages/GlobalLoading';

const Layout = () => {
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow mx-auto max-w-7xl w-full">
                    <Outlet />
                </main>
                <Footer />
            </div>
            <GlobalLoading />
        </>
    );
};
export default Layout;