import { useState, useRef } from "react";
import { Mic, Square, Play, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
  onDelete: () => void;
  hasRecording: boolean;
}

export function AudioRecorder({ onRecordingComplete, onDelete, hasRecording }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // For simulation, create an object URL. In real app, upload Blob to server.
        const url = URL.createObjectURL(blob);
        // Also could convert to base64 here for "simulated" backend
        onRecordingComplete(url); // Passing URL for preview
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone. Verifique suas permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasRecording) {
    return (
      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="h-10 w-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0">
          <Play className="w-5 h-5 ml-1" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm text-slate-700">Áudio gravado</p>
          <p className="text-xs text-slate-500">Pronto para envio</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="Excluir gravação"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`
        relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all
        ${isRecording ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
      `}>
        {isRecording ? (
          <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              <div className="relative h-16 w-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <Mic className="w-8 h-8" />
              </div>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-red-600">{formatTime(recordingDuration)}</p>
              <p className="text-sm text-red-500 font-medium animate-pulse">Gravando...</p>
            </div>
            <Button 
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 shadow-md"
            >
              <Square className="w-4 h-4 mr-2 fill-current" /> Parar Gravação
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Mic className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Clique para gravar</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Permita o acesso ao microfone para registrar sua manifestação por voz.
              </p>
            </div>
            <Button 
              onClick={startRecording}
              size="lg"
              className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Iniciar Gravação
            </Button>
          </div>
        )}
      </div>
      
      {!isRecording && (
        <div className="flex items-start gap-2 text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>Sua voz será convertida e armazenada de forma segura. Fale pausadamente para melhor compreensão.</p>
        </div>
      )}
    </div>
  );
}
