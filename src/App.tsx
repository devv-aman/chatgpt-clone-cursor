import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { router } from '@/router';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
