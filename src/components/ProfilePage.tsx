'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  User, 
  LogOut, 
  Github, 
  Mail, 
  Calendar,
  Clock,
  Database,
  BarChart3,
  Edit,
  Save,
  X,
  Shield,
  Zap
} from 'lucide-react';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Input from './ui/Input';
import LogoSpinner from './ui/LogoSpinner';
import { fadeInUp, stagger } from '@/utils/animations';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the profile
    console.log('Saving profile:', editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: session?.user?.name || '',
      email: session?.user?.email || '',
    });
    setIsEditing(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LogoSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Not Authenticated</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to view your profile.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="min-h-screen p-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div variants={fadeInUp} className="lg:col-span-1">
          <GlassCard className="p-6 text-center">
            <div className="mb-6">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20 mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
              
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-center"
                  />
                  <div className="flex space-x-2 justify-center">
                    <Button onClick={handleSaveProfile} size="sm" className="flex items-center">
                      <Save className="h-3 w-3 mr-1" />
                      <span>Save</span>
                    </Button>
                    <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {session.user?.name || 'User'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {session.user?.email}
                  </p>
                  <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm" className="flex items-center">
                    <Edit className="h-3 w-3 mr-2" />
                    <span>Edit Profile</span>
                  </Button>
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Calculations</span>
                </div>
                <span className="text-sm font-semibold text-white">24</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Models Used</span>
                </div>
                <span className="text-sm font-semibold text-white">8</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Member Since</span>
                </div>
                <span className="text-sm font-semibold text-white">Today</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <motion.div variants={fadeInUp}>
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-400" />
                Account Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3 mb-2">
                      <Github className="h-5 w-5 text-blue-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">GitHub Account</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connected via OAuth
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Secure authentication enabled
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mail className="h-5 w-5 text-green-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Email Address</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Primary contact method
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="h-5 w-5 text-purple-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Member Since</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recently joined
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Welcome to LLM Calculator!
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3 mb-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Account Status</h4>
                    </div>
                    <p className="text-sm text-green-400 font-semibold">
                      Active
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      All features available
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}