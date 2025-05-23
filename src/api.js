// Use environment variables with fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function signup(email, password) {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function createConversation(user_id) {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function sendMessage(conversation_id, message) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id,
      message,
      sender: "User"
    })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function sendVoiceMessage(conversation_id, user_id, audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  try {
    const res = await fetch(`${API_URL}/voice-chat?conversation_id=${conversation_id}&user_id=${user_id}`, {
      method: "POST",
      body: formData,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || 'Failed to process voice message';
      } catch (e) {
        errorMessage = await res.text() || 'Failed to process voice message';
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    console.log("Voice response received:", { 
      messageLength: data.ai_message?.length || 0,
      hasAudio: !!data.audio_data,
      audioSize: data.audio_data?.length || 0
    });
    return data;
  } catch (error) {
    console.error('Voice message error:', error);
    throw new Error(error.message || 'Failed to send voice message');
  }
}

export async function getConversations(user_id) {
  const res = await fetch(`${API_URL}/user/${user_id}/conversations`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function getMessages(conversation_id) {
  const res = await fetch(`${API_URL}/messages?conversation_id=${conversation_id}`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
  