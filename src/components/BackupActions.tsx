
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, Share2, QrCode } from 'lucide-react';

interface BackupActionsProps {
  exportTransactions: () => void;
  importTransactions: (file: File) => Promise<void>;
  generateSharingLink?: () => Promise<string>;
}

const BackupActions = ({ exportTransactions, importTransactions, generateSharingLink }: BackupActionsProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [sharingUrl, setSharingUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir dosya seçin.",
      });
      return;
    }

    try {
      setIsImporting(true);
      await importTransactions(selectedFile);
      setIsImportDialogOpen(false);
      setSelectedFile(null);
      toast({
        title: "İçe aktarma başarılı",
        description: "Verileriniz başarıyla içe aktarıldı.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "İçe aktarma hatası",
        description: (error as Error).message,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleGenerateQrCode = async () => {
    if (!generateSharingLink) return;
    
    try {
      const dataUrl = await generateSharingLink();
      setSharingUrl(dataUrl);
      setIsQrDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "QR Kodu Oluşturma Hatası",
        description: "QR kodu oluşturulurken bir hata oluştu."
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Veri Yönetimi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Verileriniz cihazınızda yerel olarak saklanır. Farklı cihazlar arasında veri paylaşımı için dışa/içe aktarma özelliğini kullanın.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={exportTransactions}
            className="w-full justify-start" 
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" /> Verileri Dışa Aktar
          </Button>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Verileri İçe Aktar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verileri İçe Aktar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">JSON Dosyası Seçin</Label>
                  <input
                    id="file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsImportDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={!selectedFile || isImporting}
                  >
                    {isImporting ? 'İşleniyor...' : 'İçe Aktar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {generateSharingLink && (
            <>
              <Button 
                onClick={handleGenerateQrCode}
                className="w-full justify-start" 
                variant="outline"
              >
                <QrCode className="mr-2 h-4 w-4" /> QR Kod ile Paylaş
              </Button>

              <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>QR Kod ile Veri Paylaşımı</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Bu QR kodu diğer cihazınızla tarayarak verilerinizi aktarabilirsiniz.
                    </p>
                    {sharingUrl && (
                      <div className="border border-border p-4 rounded-lg">
                        <a href={sharingUrl} download="butce-verilerim.json">
                          İndirmek için tıklayın
                        </a>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupActions;
