import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Hosted previews (e.g. inside an iframe at an arbitrary path) can't rely on URL routing.
const Router = import.meta.env.VITE_MEMORY_ROUTER ? MemoryRouter : BrowserRouter;

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>
      <Toaster position="bottom-center" />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
