import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useCreateDemand, DemandCategory, DemandType } from '@workspace/api-client-react';
import { useAuth, supabase } from '@workspace/auth-web';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AudioRecorder } from '@/components/AudioRecorder';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, FileText, Mic } from 'lucide-react';

export default function NewDemand() {
  const { isAuthenticated, login } = useAuth();
  const [, navigate] = useLocation();
  const createDemand = useCreateDemand();

  const [type, setType] = useState<DemandType>('text');
  const [category, setCategory] = useState<DemandCategory>('Sugestão de Melhoria');
  const [content, setContent] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleAudioRecording = useCallback((blob: Blob) => {
    setAudioBlob(blob);
  }, []);

  const handleAudioClear = useCallback(() => {
    setAudioBlob(null);
  }, []);

  const uploadAudio = async (blob: Blob): Promise<string | null> => {
    const ext = blob.type.includes('webm') ? 'webm' : 'mp3';
    const path = `demand-audio/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('media')
      .upload(path, blob, { contentType: blob.type || 'audio/webm' });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data?.publicUrl ?? null;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Autenticação Necessária</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para registrar uma demanda.
            </p>
            <Button onClick={login}>Entrar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'text' && !content.trim()) {
      toast.error('Descreva sua demanda.');
      return;
    }

    if (type === 'audio' && !audioBlob) {
      toast.error('Grave um áudio antes de enviar.');
      return;
    }

    let mediaUrl: string | null = null;
    if (type === 'audio' && audioBlob) {
      toast.info('Enviando áudio...');
      mediaUrl = await uploadAudio(audioBlob);
      if (!mediaUrl) {
        toast.error('Erro ao enviar áudio. Tente novamente.');
        return;
      }
    }

    createDemand.mutate(
      {
        data: {
          type,
          category,
          content: type === 'text' ? (content.trim() || null) : null,
          mediaUrl,
          latitude: null,
          longitude: null,
          address: null,
          isAnonymous,
          targetUnit: targetUnit.trim() || null,
        },
      },
      {
        onSuccess: (demand) => {
          toast.success('Demanda registrada com sucesso!', {
            description: `Protocolo: ${demand.protocol}`,
          });
          navigate(`/protocolo?p=${demand.protocol}`);
        },
        onError: () => {
          toast.error('Erro ao registrar demanda. Tente novamente.');
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/demandas')} className="mb-6 gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Nova Demanda</CardTitle>
          <CardDescription>
            Descreva um problema, solicitação ou sugestão para a comunidade acadêmica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Tipo de Registro</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={type === 'text' ? 'default' : 'outline'}
                  onClick={() => setType('text')}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" /> Texto
                </Button>
                <Button
                  type="button"
                  variant={type === 'audio' ? 'default' : 'outline'}
                  onClick={() => setType('audio')}
                  className="gap-2"
                >
                  <Mic className="w-4 h-4" /> Áudio
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DemandCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DemandCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === 'text' && (
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea
                  placeholder="Descreva sua demanda com detalhes..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length}/5000
                </p>
              </div>
            )}

            {type === 'audio' && (
              <div className="space-y-2">
                <Label>Gravação de Áudio</Label>
                <AudioRecorder
                  onRecordingComplete={handleAudioRecording}
                  onClear={handleAudioClear}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Unidade/Local alvo (opcional)</Label>
              <Input
                placeholder="Ex: Coordenação de Engenharia, Biblioteca Central"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(v) => setIsAnonymous(v === true)}
              />
              <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                Registrar como anônimo (sua identidade não será exposta publicamente)
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={createDemand.isPending} className="gap-2">
                {createDemand.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Registrar Demanda
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/demandas')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
