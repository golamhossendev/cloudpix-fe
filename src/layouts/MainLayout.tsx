import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { AlertContainer } from '../components/AlertContainer';

export const MainLayout = () => {
  return (
    <div id="app">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <AlertContainer />
    </div>
  );
};

