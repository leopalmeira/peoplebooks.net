import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';

// Public Pages
import { Home } from './pages/public/Home.js';
import { PeopleCatalog } from './pages/public/PeopleCatalog.js';
import { PersonProfile } from './pages/public/PersonProfile.js';
import { VolumesList } from './pages/public/VolumesList.js';
import { VolumeDetail } from './pages/public/VolumeDetail.js';
import { BecomeAStory } from './pages/public/BecomeAStory.js';
import { HowItWorks } from './pages/public/HowItWorks.js';
import { About } from './pages/public/About.js';
import { Login } from './pages/public/Login.js';
import { Register } from './pages/public/Register.js';

// Reader Pages
import { Library } from './pages/reader/Library.js';
import { ActivateVolume } from './pages/reader/ActivateVolume.js';
import { MyFeed } from './pages/reader/MyFeed.js';

// Participant Pages
import { Studio } from './pages/participant/Studio.js';

// Admin Pages
import { Admin } from './pages/admin/Admin.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-pb-bg text-pb-text">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/people" element={<PeopleCatalog />} />
            <Route path="/people/:slug" element={<PersonProfile />} />
            <Route path="/volumes" element={<VolumesList />} />
            <Route path="/volumes/:slug" element={<VolumeDetail />} />
            <Route path="/become-a-story" element={<BecomeAStory />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Reader */}
            <Route path="/library" element={<Library />} />
            <Route path="/activate" element={<ActivateVolume />} />
            <Route path="/my-feed" element={<MyFeed />} />

            {/* Participant */}
            <Route path="/studio" element={<Studio />} />

            {/* Admin */}
            <Route path="/admin" element={<Admin />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

