import React, { useState } from 'react';

const FeatureTest = () => {
  const [testResults, setTestResults] = useState({});

  const runTest = (testName, testFunction) => {
    try {
      const result = testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'pass', result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'fail', error: error.message }
      }));
    }
  };

  const tests = {
    'Speech Recognition': () => {
      if ('webkitSpeechRecognition' in window) {
        return 'Supported';
      }
      throw new Error('Not supported');
    },
    'Media Devices': () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return 'Supported';
      }
      throw new Error('Not supported');
    },
    'Local Storage': () => {
      localStorage.setItem('test', 'value');
      const value = localStorage.getItem('test');
      localStorage.removeItem('test');
      if (value === 'value') {
        return 'Working';
      }
      throw new Error('Not working');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Feature Tests</h1>
      
      <div className="space-y-4">
        {Object.entries(tests).map(([testName, testFunction]) => (
          <div key={testName} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{testName}</h3>
              <button
                onClick={() => runTest(testName, testFunction)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Test
              </button>
            </div>
            
            {testResults[testName] && (
              <div className={`mt-2 p-2 rounded text-sm ${
                testResults[testName].status === 'pass' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults[testName].status === 'pass' 
                  ? `✅ ${testResults[testName].result}`
                  : `❌ ${testResults[testName].error}`
                }
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => {
            Object.entries(tests).forEach(([testName, testFunction]) => {
              runTest(testName, testFunction);
            });
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Run All Tests
        </button>
      </div>
    </div>
  );
};

export default FeatureTest;