import React, { useState } from 'react';
import {
  Calendar,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import Button from '../ui/Button';
import { useScheduleStore } from '../../stores/scheduleStore';
import { ViewType } from '../../types';

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { currentView, setCurrentView, currentSchedule } = useScheduleStore();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);

    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              Schedule Builder
            </h1>
            {currentSchedule && (
              <span className="ml-4 text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                {currentSchedule.name}
              </span>
            )}
          </div>

          <div className="hidden md:flex space-x-2">
            <Button
              variant={currentView === ViewType.DAY ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView(ViewType.DAY)}
            >
              Day
            </Button>
            <Button
              variant={currentView === ViewType.WEEK ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView(ViewType.WEEK)}
            >
              Week
            </Button>
            <Button
              variant={currentView === ViewType.MONTH ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView(ViewType.MONTH)}
            >
              Month
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              aria-label="Analytics"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 py-2 px-4 animate-slide-in-right">
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Button
                variant={currentView === ViewType.DAY ? 'primary' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setCurrentView(ViewType.DAY);
                  setMobileMenuOpen(false);
                }}
              >
                Day
              </Button>
              <Button
                variant={currentView === ViewType.WEEK ? 'primary' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setCurrentView(ViewType.WEEK);
                  setMobileMenuOpen(false);
                }}
              >
                Week
              </Button>
              <Button
                variant={currentView === ViewType.MONTH ? 'primary' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setCurrentView(ViewType.MONTH);
                  setMobileMenuOpen(false);
                }}
              >
                Month
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                toggleDarkMode();
                setMobileMenuOpen(false);
              }}
            >
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5 mr-2" />
                  Light mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 mr-2" />
                  Dark mode
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
