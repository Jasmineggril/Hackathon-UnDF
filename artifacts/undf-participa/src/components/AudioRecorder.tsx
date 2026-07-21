import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onClear: () => void;
}

export function AudioRecorder({ onRecordingComplete, onClear }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const clearRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    onClear();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-muted/30">
      {!audioUrl ? (
        <>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isRecording ? 'bg-destructive/20 animate-pulse' : 'bg-primary/10'}`}>
            <Mic className={`w-10 h-10 ${isRecording ? 'text-destructive' : 'text-primary'}`} />
          </div>
          
          <div className="text-xl font-medium tabular-nums">
            {formatTime(recordingTime)}
          </div>
          
          {isRecording ? (
            <Button variant="destructive" onClick={stopRecording} className="gap-2">
              <Square className="w-4 h-4" /> Parar Gravação
            </Button>
          ) : (
            <Button onClick={startRecording} className="gap-2" variant="default">
              <Mic className="w-4 h-4" /> Iniciar Gravação
            </Button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-full flex items-center gap-4 bg-background p-3 rounded-md border">
            <Button variant="ghost" size="icon" className="shrink-0 text-primary">
              <Play className="w-5 h-5 fill-current" />
            </Button>
            <audio src={audioUrl} controls className="w-full h-10" />
          </div>
          <Button variant="outline" onClick={clearRecording} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" /> Gravar Novamente
          </Button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground text-center mt-2 max-w-[250px]">
        {isRecording 
          ? "Fale claramente próximo ao microfone." 
          : "Gravação de áudio para descrever sua demanda com mais facilidade."}
      </p>
    </div>
  );
}
