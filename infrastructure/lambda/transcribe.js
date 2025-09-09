const AWS = require('aws-sdk');

const transcribe = new AWS.TranscribeService();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    const { sessionId, audioUrl, questionIndex } = JSON.parse(event.body);
    
    // Start transcription job
    const jobName = `interview-${sessionId}-${questionIndex}-${Date.now()}`;
    const transcriptionParams = {
      TranscriptionJobName: jobName,
      LanguageCode: 'en-US',
      Media: {
        MediaFileUri: audioUrl
      },
      OutputBucketName: process.env.RESUME_BUCKET,
      Settings: {
        ShowSpeakerLabels: false,
        MaxSpeakerLabels: 1
      }
    };
    
    await transcribe.startTranscriptionJob(transcriptionParams).promise();
    
    // Poll for completion
    let jobStatus = 'IN_PROGRESS';
    let transcript = '';
    
    while (jobStatus === 'IN_PROGRESS') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const jobResult = await transcribe.getTranscriptionJob({
        TranscriptionJobName: jobName
      }).promise();
      
      jobStatus = jobResult.TranscriptionJob.TranscriptionJobStatus;
      
      if (jobStatus === 'COMPLETED') {
        const transcriptUri = jobResult.TranscriptionJob.Transcript.TranscriptFileUri;
        const transcriptData = await fetch(transcriptUri).then(res => res.json());
        transcript = transcriptData.results.transcripts[0].transcript;
      } else if (jobStatus === 'FAILED') {
        throw new Error('Transcription failed');
      }
    }
    
    // Update interview session with transcript
    await dynamodb.update({
      TableName: process.env.INTERVIEWS_TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET answers[#idx] = :answer',
      ExpressionAttributeNames: {
        '#idx': questionIndex.toString()
      },
      ExpressionAttributeValues: {
        ':answer': {
          transcript,
          audioUrl,
          timestamp: new Date().toISOString()
        }
      }
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({
        transcript,
        questionIndex
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({ error: 'Failed to transcribe audio' })
    };
  }
};