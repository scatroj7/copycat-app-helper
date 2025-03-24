
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, TransactionType, FrequencyType, CategoryType } from '@/hooks/useTransactions';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  editingTransaction: Transaction | null;
}

const TransactionModal = ({ isOpen, onClose, onSave, editingTransaction }: TransactionModalProps) => {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'> & { id?: string }>({
    type: 'expense',
    description: '',
    amount: 0,
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    frequency: 'once',
    notes: '',
    installmentCount: null
  });

  // Reset form when modal opens/closes or when editing transaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setFormData(editingTransaction);
      } else {
        // Reset to defaults
        setFormData({
          type: 'expense',
          description: '',
          amount: 0,
          category: 'other',
          date: new Date().toISOString().split('T')[0],
          frequency: 'once',
          notes: '',
          installmentCount: null
        });
      }
    }
  }, [isOpen, editingTransaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'installmentCount') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 2
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    setFormData({
      ...formData,
      date: date.toISOString().split('T')[0]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle installments creation for custom frequency
    if (formData.frequency === 'custom' && formData.installmentCount && formData.installmentCount > 1) {
      const baseTransaction = {...formData};
      const baseDate = new Date(baseTransaction.date);
      
      // Create the first installment (current transaction)
      const firstInstallment = {
        ...baseTransaction,
        notes: baseTransaction.notes ? `${baseTransaction.notes} (Taksit 1/${baseTransaction.installmentCount})` : `Taksit 1/${baseTransaction.installmentCount}`
      };
      
      // Create subsequent installments
      const installments = [firstInstallment];
      
      for (let i = 1; i < baseTransaction.installmentCount; i++) {
        // Calculate next month date
        const nextMonth = new Date(baseDate);
        nextMonth.setMonth(baseDate.getMonth() + i);
        
        const installment = {
          ...baseTransaction,
          id: undefined, // Ensure new transactions get new IDs
          date: nextMonth.toISOString().split('T')[0],
          notes: baseTransaction.notes ? `${baseTransaction.notes} (Taksit ${i+1}/${baseTransaction.installmentCount})` : `Taksit ${i+1}/${baseTransaction.installmentCount}`
        };
        
        installments.push(installment);
      }
      
      // Save all installments
      installments.forEach(installment => {
        onSave(installment);
      });
    } else {
      // Regular single transaction
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-card w-full max-w-md rounded-lg shadow-xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-semibold">
            {editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionType">İşlem Tipi</Label>
              <select 
                id="transactionType" 
                name="type" 
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 bg-secondary rounded-md border border-border"
              >
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input 
                id="description" 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01"
                value={formData.amount || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <select 
                id="category" 
                name="category" 
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 bg-secondary rounded-md border border-border"
              >
                <option value="salary">Maaş</option>
                <option value="rent">Kira</option>
                <option value="groceries">Market</option>
                <option value="bills">Faturalar</option>
                <option value="transportation">Ulaşım</option>
                <option value="entertainment">Eğlence</option>
                <option value="health">Sağlık</option>
                <option value="education">Eğitim</option>
                <option value="loan">Kredi</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tarih</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(new Date(formData.date), 'dd.MM.yyyy')
                    ) : (
                      <span>Tarih Seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Sıklık</Label>
              <select 
                id="frequency" 
                name="frequency" 
                value={formData.frequency}
                onChange={handleChange}
                className="w-full p-2 bg-secondary rounded-md border border-border"
              >
                <option value="once">Tek Seferlik</option>
                <option value="monthly">Her Ay</option>
                <option value="quarterly">3 Ayda Bir</option>
                <option value="biannual">6 Ayda Bir</option>
                <option value="yearly">Yıllık</option>
                <option value="custom">Taksitli Ödeme</option>
              </select>
            </div>

            {formData.frequency === 'custom' && (
              <div className="space-y-2" id="installmentGroup">
                <Label htmlFor="installmentCount">Taksit Sayısı</Label>
                <Input 
                  id="installmentCount" 
                  name="installmentCount" 
                  type="number" 
                  min="2"
                  value={formData.installmentCount || 2}
                  onChange={handleChange}
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">
                  İlk taksit seçilen tarihten başlayacak, diğer taksitler aylık olarak eklenecektir.
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                value={formData.notes || ''}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit">
                Kaydet
              </Button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TransactionModal;
