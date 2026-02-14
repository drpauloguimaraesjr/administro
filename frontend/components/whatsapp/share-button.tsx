'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ShareButtonProps {
  text?: string;
  imageUrl?: string;
  transactionId?: string;
}

export function ShareButton({ text, imageUrl, transactionId }: ShareButtonProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSend = async () => {
    if (!phone) {
      alert('Digite um número de telefone');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://administro-production.up.railway.app';

      if (imageUrl) {
        // Enviar imagem
        const response = await fetch(`${backendUrl}/api/whatsapp/send-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone.includes('@') ? phone : `${phone}@s.whatsapp.net`,
            imageUrl: imageUrl,
            caption: text || '',
          }),
        });

        if (!response.ok) throw new Error('Erro ao enviar imagem');
      } else {
        // Enviar mensagem de texto
        const response = await fetch(`${backendUrl}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone.includes('@') ? phone : `${phone}@s.whatsapp.net`,
            text: text || '',
          }),
        });

        if (!response.ok) throw new Error('Erro ao enviar mensagem');
      }

      alert('Mensagem enviada com sucesso!');
      setOpen(false);
      setPhone('');
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar mensagem. Verifique se o WhatsApp está conectado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="w-4 h-4 mr-2" />
          Enviar via WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar via WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Número do WhatsApp (com DDD, sem espaços)
            </label>
            <Input
              type="tel"
              placeholder="5511999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exemplo: 5511999999999 (55 + DDD + número)
            </p>
          </div>

          {text && (
            <div>
              <label className="text-sm font-medium mb-2 block">Mensagem</label>
              <div className="p-3 bg-slate-100 rounded-lg text-sm">
                {text}
              </div>
            </div>
          )}

          {imageUrl && (
            <div>
              <label className="text-sm font-medium mb-2 block">Imagem</label>
              <img src={imageUrl} alt="Preview" className="max-w-full rounded-lg" />
            </div>
          )}

          <Button onClick={handleSend} disabled={loading || !phone} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

