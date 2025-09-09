import React, { useState, useRef } from 'react';

const SimpleSpeechTest = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported. Use Chrome browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
      let result = '';
      for (let i = 0; i < event.results.length; i++) {
        result += event.results[i][0].transcript;
      }
      setTranscript(result);
    };

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-4">Speech Recognition Test</h3>
      
      <div className="mb-4">
        {!isListening ? (
          <button 
            onClick={startListening}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start Listening
          </button>
        ) : (
          <button 
            onClick={stopListening}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Stop Listening
          </button>
        )}
      </div>

      {isListening && (
        <div className="mb-4 text-red-600 font-medium">
          🎤 Listening... Speak now!
        </div>
      )}

      <div className="p-3 bg-white border rounded min-h-[100px]">
        <strong>Transcript:</strong>
        <p>{transcript || 'No speech detected yet...'}</p>
      </div>
    </div>
  );
};

export default SimpleSpeechTest;