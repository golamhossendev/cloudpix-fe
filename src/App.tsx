import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Files } from './pages/Files';
import { Shared } from './pages/Shared';

export const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="files" element={<Files />} />
            <Route path="shared" element={<Shared />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};
