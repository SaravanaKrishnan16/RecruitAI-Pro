import React, { useState, useRef } from 'react';

const MicrophoneTest = () => {
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micStatus, setMicStatus] = useState('');
  const [speechStatus, setSpeechStatus] = useState('');
  const [testTranscript, setTestTranscript] = useState('');
  const recognitionRef = useRef(null);

  const testMicrophone = async () => {
    setIsTestingMic(true);
    setMicStatus('Testing microphone access...');
    
    try {
      // Test microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('✅ Microphone access granted');
      
      // Test speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setSpeechStatus('✅ Speech recognition available');
        
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setSpeechStatus('🎤 Speech recognition started - say something!');
        };
        
        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setTestTranscript(transcript);
        };
        
        recognition.onerror = (event) => {
          setSpeechStatus(`❌ Speech recognition error: ${event.error}`);
        };
        
        recognition.onend = () => {
          setSpeechStatus('✅ Speech recognition test completed');
          setIsTestingMic(false);
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        recognitionRef.current = recognition;
        recognition.start();
        
        // Auto-stop after 5 seconds
        setTimeout(() => {
          if (recognition) {
            recognition.stop();
          }
        }, 5000);
        
      } else {
        setSpeechStatus('❌ Speech recognition not supported in this browser');
        setIsTestingMic(false);
        stream.getTracks().forEach(track => track.stop());
      }
      
    } catch (error) {
      setMicStatus(`❌ Microphone access denied: ${error.message}`);
      setSpeechStatus('Cannot test speech recognition without microphone access');
      setIsTestingMic(false);
    }
  };

  const stopTest = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsTestingMic(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-blue-800 mb-3">🎤 Microphone & Speech Test</h3>
      
      <div className="space-y-2 mb-4">
        {micStatus && (
          <div className="text-sm">
            <strong>Microphone:</strong> {micStatus}
          </div>
        )}
        {speechStatus && (
          <div className="text-sm">
            <strong>Speech Recognition:</strong> {speechStatus}
          </div>
        )}
        {testTranscript && (
          <div className="text-sm bg-white p-2 rounded border">
            <strong>You said:</strong> "{testTranscript}"
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        {!isTestingMic ? (
          <button
            onClick={testMicrophone}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            Test Microphone
          </button>
        ) : (
          <button
            onClick={stopTest}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded"
          >
            Stop Test
          </button>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <p>This test checks if your microphone and speech recognition are working properly.</p>
        <p>If you see errors, please check your browser permissions and try using Chrome or Edge.</p>
      </div>
    </div>
  );
};

export default MicrophoneTest;