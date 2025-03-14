
import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface BackupActionsProps {
  exportTransactions: () => void;
  importTransactions: (file: File) => Promise<void>;
}

const BackupActions = ({ exportTransactions, importTransactions }: BackupActionsProps) => {
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      exportTransactions();
      toast({
        title: "Veriler dışa aktarıldı",
        description: "Verileriniz başarıyla JSON dosyası olarak kaydedildi.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Veriler dışa aktarılırken bir sorun oluştu: " + (error as Error).message,
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    setIsImporting(true);

    try {
      await importTransactions(file);
      toast({
        title: "Veriler içe aktarıldı",
        description: "Verileriniz başarıyla yüklendi.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Veriler içe aktarılırken bir sorun oluştu: " + (error as Error).message,
      });
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Veri Yedekleme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground mb-4">
          Verileriniz otomatik olarak buluta kaydedilmektedir. Farklı cihazlardan eriştiğinizde verileriniz senkronize olur.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" /> Verileri Dışa Aktar
          </Button>
          
          <div className="relative">
            <input
              type="file"
              id="import-file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button 
              variant="outline" 
              disabled={isImporting}
              className="flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" /> Verileri İçe Aktar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupActions;
