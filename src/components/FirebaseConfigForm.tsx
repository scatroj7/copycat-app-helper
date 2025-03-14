
import React, { useState } from 'react';
import { saveFirebaseConfig, getCurrentFirebaseConfig } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

type FirebaseConfigKeys = 'apiKey' | 'authDomain' | 'projectId' | 'storageBucket' | 'messagingSenderId' | 'appId';

interface FirebaseConfigFormProps {
  onConfigSaved?: () => void;
}

const FirebaseConfigForm = ({ onConfigSaved }: FirebaseConfigFormProps) => {
  const currentConfig = getCurrentFirebaseConfig();
  const [config, setConfig] = useState(currentConfig);
  const [open, setOpen] = useState(false);

  const handleChange = (key: FirebaseConfigKeys, value: string) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Basit validasyon
      const requiredFields: FirebaseConfigKeys[] = ['apiKey', 'projectId', 'authDomain'];
      for (const field of requiredFields) {
        if (!config[field]) {
          throw new Error(`${field} alanı gereklidir.`);
        }
      }

      saveFirebaseConfig(config);
      setOpen(false);
      
      if (onConfigSaved) {
        onConfigSaved();
      }

      toast({
        title: "Firebase yapılandırması güncellendi",
        description: "Yeni yapılandırmanız kaydedildi ve sayfa yenilendi.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: (error as Error).message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Firebase Yapılandırmasını Düzenle</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Firebase Yapılandırması</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              value={config.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="AIzaSyExampleApiKey123456"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="authDomain">Auth Domain *</Label>
            <Input
              id="authDomain"
              value={config.authDomain}
              onChange={(e) => handleChange('authDomain', e.target.value)}
              placeholder="your-project-id.firebaseapp.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID *</Label>
            <Input
              id="projectId"
              value={config.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              placeholder="your-project-id"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="storageBucket">Storage Bucket</Label>
            <Input
              id="storageBucket"
              value={config.storageBucket}
              onChange={(e) => handleChange('storageBucket', e.target.value)}
              placeholder="your-project-id.appspot.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
            <Input
              id="messagingSenderId"
              value={config.messagingSenderId}
              onChange={(e) => handleChange('messagingSenderId', e.target.value)}
              placeholder="123456789012"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="appId">App ID</Label>
            <Input
              id="appId"
              value={config.appId}
              onChange={(e) => handleChange('appId', e.target.value)}
              placeholder="1:123456789012:web:abcdef1234567890"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FirebaseConfigForm;
