import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPages from './components/AuthPages';
import ProfilePage from './components/ProfilePage';
import ReportItemPage from './components/ReportItemPage';
import MyItemsPage from './components/MyItemsPage';
import MessagesPage from './components/MessagesPage';
import HomePage from './components/HomePage';
import ExplorePage from './components/ExplorePage';
import AboutPage from './components/AboutPage';
import HowItWorksPage from './components/HowItWorksPage';
import FeaturesPage from './components/FeaturesPage';
import ContactPage from './components/ContactPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { isAuthenticated, user } = useAuth();

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !['login', 'signup', 'home', 'about', 'features', 'how-it-works', 'contact'].includes(currentPage)) {
    return <AuthPages type="login" onPageChange={setCurrentPage} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <AuthPages type="login" onPageChange={setCurrentPage} />;
      case 'signup':
        return <AuthPages type="signup" onPageChange={setCurrentPage} />;
      case 'profile':
        return isAuthenticated ? <ProfilePage onPageChange={setCurrentPage} /> : <AuthPages type="login" onPageChange={setCurrentPage} />;
      case 'report-lost':
        return isAuthenticated ? <ReportItemPage type="lost" onPageChange={setCurrentPage} /> : <AuthPages type="login" onPageChange={setCurrentPage} />;
      case 'report-found':
        return isAuthenticated ? <ReportItemPage type="found" onPageChange={setCurrentPage} /> : <AuthPages type="login" onPageChange={setCurrentPage} />;
      case 'explore':
        return <ExplorePage />;
      case 'my-items':
        return isAuthenticated ? <MyItemsPage onPageChange={setCurrentPage} /> : <AuthPages type="login" onPageChange={setCurrentPage} />;
      case 'messages':
        return isAuthenticated ? <MessagesPage onPageChange={setCurrentPage} /> : <AuthPages type="login" onPageChange={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'features':
        return <FeaturesPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AI Lost & Found System</h3>
              <p className="text-gray-400 text-sm">
                Revolutionizing campus lost and found with AI-powered smart matching technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setCurrentPage('features')} className="hover:text-white">Features</button></li>
                <li><button onClick={() => setCurrentPage('how-it-works')} className="hover:text-white">How It Works</button></li>
                <li><button onClick={() => setCurrentPage('report-lost')} className="hover:text-white">Report Lost</button></li>
                <li><button onClick={() => setCurrentPage('report-found')} className="hover:text-white">Report Found</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setCurrentPage('about')} className="hover:text-white">About</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-white">Contact</button></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Campus Integration</a></li>
                <li><a href="#" className="hover:text-white">Technical Support</a></li>
                <li><a href="#" className="hover:text-white">System Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AI-Powered Lost Item Recovery System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}export default App;