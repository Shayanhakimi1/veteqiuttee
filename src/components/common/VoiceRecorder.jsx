import React, { useState, useRef } from 'react';

const VoiceRecorder = ({ onRecordingComplete, maxDuration = 300 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // ایجاد فایل برای ارسال
        const file = new File([blob], `voice-recording-${Date.now()}.wav`, {
          type: 'audio/wav'
        });
        
        if (onRecordingComplete) {
          onRecordingComplete([file]);
        }
        
        // متوقف کردن تمام tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // شروع تایمر
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('خطا در دسترسی به میکروفون:', error);
      alert('دسترسی به میکروفون امکان‌پذیر نیست. لطفاً مجوز دسترسی را بدهید.');
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

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    
    if (onRecordingComplete) {
      onRecordingComplete([]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          🎤 ضبط صدا (اختیاری)
        </h4>
        <span className="text-xs text-gray-500">
          حداکثر {Math.floor(maxDuration / 60)} دقیقه
        </span>
      </div>
      
      <p className="text-xs text-gray-600 mb-3">
        در صورت نیاز صدای خود را ضبط کنید
      </p>

      {!audioBlob ? (
        <div className="text-center">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
              شروع ضبط
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">
                  در حال ضبط... {formatTime(recordingTime)}
                </span>
              </div>
              
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                توقف ضبط
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                ضبط شده: {formatTime(recordingTime)}
              </span>
              <button
                type="button"
                onClick={deleteRecording}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                حذف
              </button>
            </div>
            
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/wav" />
              مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
            </audio>
          </div>
          
          <button
            type="button"
            onClick={() => {
              deleteRecording();
            }}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            ضبط مجدد
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;