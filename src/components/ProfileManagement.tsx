import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { Icons } from './ui/icons';
import { toast } from './ui/toast';
import { apiService } from '../utils/supabase/api';

interface User {
  id: string;
  email: string;
  name: string;
  profile?: {
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
    phone?: string;
    address?: string;
    bio?: string;
    timezone?: string;
  };
}

interface ProfileManagementProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export function ProfileManagement({ user, onUserUpdate }: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userRole, setUserRole] = useState<'super_admin' | 'sub_admin' | 'employee'>('employee');
  
  const [profileData, setProfileData] = useState({
    firstName: user.profile?.firstName || '',
    lastName: user.profile?.lastName || '',
    email: user.email || '',
    company: user.profile?.company || '',
    jobTitle: user.profile?.jobTitle || '',
    phone: user.profile?.phone || '',
    address: user.profile?.address || '',
    bio: user.profile?.bio || '',
    timezone: user.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    birthdayReminders: true,
    orderReminders: true,
    marketingEmails: false,
    darkMode: false,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currency: 'INR'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // New user creation state
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'employee' as 'sub_admin' | 'employee',
    position: '',
    department: '',
    hireDate: ''
  });

  useEffect(() => {
    // Load user preferences from localStorage or API
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        setPreferences(prev => ({ ...prev, ...JSON.parse(savedPreferences) }));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }

    // Check user role (in a real app, this would come from the API)
    // For now, we'll assume the first user is super admin
    const isFirstUser = !localStorage.getItem('hasUsers');
    if (isFirstUser) {
      setUserRole('super_admin');
      localStorage.setItem('hasUsers', 'true');
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('userPreferences', JSON.stringify(updated));
      return updated;
    });
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profileData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfile()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Here you would make an API call to update the profile
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      const updatedUser = {
        ...user,
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        profile: {
          ...user.profile,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          company: profileData.company,
          jobTitle: profileData.jobTitle,
          phone: profileData.phone,
          address: profileData.address,
          bio: profileData.bio,
          timezone: profileData.timezone
        }
      };

      onUserUpdate(updatedUser);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Here you would make an API call to change password
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateNewUser()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Here you would make an API call to create a new user
      console.log('Creating new user:', newUserData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${newUserData.role === 'sub_admin' ? 'Sub Admin' : 'Employee'} account created successfully!`);
      
      // Reset form
      setNewUserData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'employee',
        position: '',
        department: '',
        hireDate: ''
      });
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateNewUser = () => {
    const newErrors: Record<string, string> = {};

    if (!newUserData.email.trim()) {
      newErrors.newUserEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUserData.email)) {
      newErrors.newUserEmail = 'Please enter a valid email address';
    }

    if (!newUserData.password.trim()) {
      newErrors.newUserPassword = 'Password is required';
    } else if (newUserData.password.length < 8) {
      newErrors.newUserPassword = 'Password must be at least 8 characters';
    }

    if (!newUserData.firstName.trim()) {
      newErrors.newUserFirstName = 'First name is required';
    }

    if (!newUserData.lastName.trim()) {
      newErrors.newUserLastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-4 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                >
                  📷
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600">{user.profile?.jobTitle || 'Jewelry Store Manager'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                  Active Account
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary border-primary hover:bg-primary/10"
              >
                ✏️
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.User className="w-5 h-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <Icons.AlertCircle className="w-3 h-3" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <Icons.AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="+91 98765 43210"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <Icons.AlertCircle className="w-3 h-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Building className="w-5 h-5 text-primary" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      name="company"
                      value={profileData.company}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="GEMSTONE Fine Jewelry"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={profileData.jobTitle}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Store Manager"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Complete business address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Description</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Brief description about yourself or your role..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icons.Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="birthdayReminders">Birthday Reminders</Label>
                    <p className="text-sm text-gray-600">Get notified about customer birthdays</p>
                  </div>
                  <Switch
                    id="birthdayReminders"
                    checked={preferences.birthdayReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('birthdayReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="orderReminders">Order Reminders</Label>
                    <p className="text-sm text-gray-600">Get notified about upcoming deliveries</p>
                  </div>
                  <Switch
                    id="orderReminders"
                    checked={preferences.orderReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('orderReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Display Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚙️
                  Display Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-gray-600">Switch to dark theme</p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <select
                    id="dateFormat"
                    value={preferences.dateFormat}
                    onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔑
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className={errors.currentPassword ? 'border-red-500' : ''}
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <Icons.AlertCircle className="w-3 h-3" />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className={errors.newPassword ? 'border-red-500' : ''}
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <Icons.AlertCircle className="w-3 h-3" />
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <Icons.AlertCircle className="w-3 h-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        🔑
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🛡️
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icons.CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Account Verified</p>
                      <p className="text-sm text-green-700">Your email address has been verified</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    📱
                    <div>
                      <p className="font-medium text-blue-900">Two-Factor Authentication</p>
                      <p className="text-sm text-blue-700">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-100">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'users':
        return userRole === 'super_admin' ? (
          <div className="space-y-6">
            {/* Create New User */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.UserPlus className="w-5 h-5 text-primary" />
                  Create New User Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newUserFirstName">First Name</Label>
                      <Input
                        id="newUserFirstName"
                        name="firstName"
                        value={newUserData.firstName}
                        onChange={handleNewUserInputChange}
                        className={errors.newUserFirstName ? 'border-red-500' : ''}
                        placeholder="Enter first name"
                      />
                      {errors.newUserFirstName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <Icons.AlertCircle className="w-3 h-3" />
                          {errors.newUserFirstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserLastName">Last Name</Label>
                      <Input
                        id="newUserLastName"
                        name="lastName"
                        value={newUserData.lastName}
                        onChange={handleNewUserInputChange}
                        className={errors.newUserLastName ? 'border-red-500' : ''}
                        placeholder="Enter last name"
                      />
                      {errors.newUserLastName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <Icons.AlertCircle className="w-3 h-3" />
                          {errors.newUserLastName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserEmail">Email Address</Label>
                      <Input
                        id="newUserEmail"
                        name="email"
                        type="email"
                        value={newUserData.email}
                        onChange={handleNewUserInputChange}
                        className={errors.newUserEmail ? 'border-red-500' : ''}
                        placeholder="Enter email address"
                      />
                      {errors.newUserEmail && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <Icons.AlertCircle className="w-3 h-3" />
                          {errors.newUserEmail}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserPassword">Password</Label>
                      <Input
                        id="newUserPassword"
                        name="password"
                        type="password"
                        value={newUserData.password}
                        onChange={handleNewUserInputChange}
                        className={errors.newUserPassword ? 'border-red-500' : ''}
                        placeholder="Enter password (min 8 characters)"
                      />
                      {errors.newUserPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <Icons.AlertCircle className="w-3 h-3" />
                          {errors.newUserPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserPhone">Phone Number</Label>
                      <Input
                        id="newUserPhone"
                        name="phone"
                        value={newUserData.phone}
                        onChange={handleNewUserInputChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserRole">Role</Label>
                      <select
                        id="newUserRole"
                        name="role"
                        value={newUserData.role}
                        onChange={handleNewUserInputChange}
                        className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="employee">Employee</option>
                        <option value="sub_admin">Sub Admin</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserPosition">Position</Label>
                      <Input
                        id="newUserPosition"
                        name="position"
                        value={newUserData.position}
                        onChange={handleNewUserInputChange}
                        placeholder="e.g., Sales Associate, Manager"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserDepartment">Department</Label>
                      <Input
                        id="newUserDepartment"
                        name="department"
                        value={newUserData.department}
                        onChange={handleNewUserInputChange}
                        placeholder="e.g., Sales, Management"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserHireDate">Hire Date</Label>
                      <Input
                        id="newUserHireDate"
                        name="hireDate"
                        type="date"
                        value={newUserData.hireDate}
                        onChange={handleNewUserInputChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewUserData({
                        email: '',
                        password: '',
                        firstName: '',
                        lastName: '',
                        phone: '',
                        role: 'employee',
                        position: '',
                        department: '',
                        hireDate: ''
                      })}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Icons.UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* User Management Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Info className="w-5 h-5 text-blue-600" />
                  User Management Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Role Permissions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Super Admin:</strong> Full system access, can create sub admins and employees</li>
                    <li><strong>Sub Admin:</strong> Can manage leads, orders, inventory, and dealers</li>
                    <li><strong>Employee:</strong> Can view and update assigned leads and orders</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Account Creation</h4>
                  <p className="text-sm text-green-800">
                    When you create a new account, the user will receive login credentials and can access the system based on their assigned role.
                    Make sure to communicate the login details securely to the new user.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <Icons.Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">Only Super Admins can create new user accounts.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: Icons.User },
              { id: 'preferences', label: 'Preferences', icon: () => '⚙️' },
              { id: 'security', label: 'Security', icon: Icons.Shield },
              ...(userRole === 'super_admin' ? [{ id: 'users', label: 'User Management', icon: Icons.Users }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}