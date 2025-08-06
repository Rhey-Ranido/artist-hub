import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Upload, Lock, Mail, AlertTriangle } from 'lucide-react';

const SettingsDemo = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate getting user from storage or context
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">Please log in to access settings</p>
          <Button onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Account Settings Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">{user.email}</p>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                  <Badge variant={user.isVerified ? 'default' : 'secondary'} className="text-xs">
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={handleOpenSettings} className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Open Settings</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium text-sm">Profile Picture</h3>
              <p className="text-xs text-gray-500">Upload & manage</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium text-sm">Personal Info</h3>
              <p className="text-xs text-gray-500">Name, phone, etc.</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-medium text-sm">Security</h3>
              <p className="text-xs text-gray-500">Password & email</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <h3 className="font-medium text-sm">Danger Zone</h3>
              <p className="text-xs text-gray-500">Delete account</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              The UserSettings page includes all the features above with full API integration!
            </p>
            <Button variant="outline" onClick={handleOpenSettings}>
              Try It Now →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsDemo; 