// export const dynamic = 'force-dynamic';

// async function getVoiceList() {
//   const baseUrl = process.env.OPENAI_API_BASE_URL || 'https://openai.qiniu.com/v1';
//   const apiKey = process.env.OPENAI_API_KEY;

//   console.log('Environment variables:', {
//     baseUrl,
//     hasApiKey: !!apiKey,
//     apiKeyLength: apiKey?.length || 0
//   });

//   if (!apiKey) {
//     throw new Error('OPENAI_API_KEY is not configured');
//   }

//   try {
//     const url = `${baseUrl}/voice/list`;
//     console.log('Making request to:', url);

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${apiKey}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     console.log('Response status:', response.status);
//     console.log('Response headers:', Object.fromEntries(response.headers.entries()));

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Error response:', errorText);
//       throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//     }

//     const data = await response.json();
//     console.log('Success response:', data);
//     return data;
//   } catch (error) {
//     console.error('Error fetching voice list:', error);
//     throw error;
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const voiceList = await getVoiceList();

//     return Response.json({
//       success: true,
//       data: voiceList,
//     });
//   } catch (error) {
//     console.error('Error in GET /api/voice/list:', error);

//     return Response.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error',
//       },
//       { status: 500 }
//     );
//   }
// }

import voiceList from '@/lib/voiceList.json';

export async function GET(_req: Request) {
  return Response.json({
    success: true,
    data: voiceList,
  });
}