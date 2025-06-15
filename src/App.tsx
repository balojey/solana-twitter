import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppWalletProvider } from './components/WalletProvider';
import { ThemeProvider } from './components/theme-provider';
import { AppShell } from './components/layout/AppShell';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { TweetPage } from './pages/TweetPage';
import { ExplorePage } from './pages/ExplorePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { BookmarksPage } from './pages/BookmarksPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="solana-theme">
      <AppWalletProvider>
        <TooltipProvider>
          <Router>
            <AppShell>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile/:pubkey" element={<ProfilePage />} />
                <Route path="/tweet/:pubkey" element={<TweetPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
              </Routes>
            </AppShell>
            <Toaster />
          </Router>
        </TooltipProvider>
      </AppWalletProvider>
    </ThemeProvider>
  );
}

export default App;