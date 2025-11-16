document.getElementById('generate-btn').addEventListener('click', async () => {
  const mood = document.getElementById('mood-input').value.trim();
  const statusEl = document.getElementById('status');
  const imgEl = document.getElementById('generated-image');
  const containerEl = document.getElementById('image-container');

  if (!mood) {
    statusEl.textContent = 'Please enter a description of your mood.';
    containerEl.classList.add('hidden');
    return;
  }

  statusEl.textContent = 'Painting your mood...';
  containerEl.classList.add('hidden');

  try {
    // Replace this API key with your own key from DeepAI. You can obtain
    // a free key by signing up at https://deepai.org. Without a valid
    // key, the API will return an authentication error.
    const apiKey = 'YOUR_DEEPAI_API_KEY';
    const response = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ text: mood })
    });

    if (!response.ok) {
      throw new Error('Failed to generate image. Please try again.');
    }

    const data = await response.json();
    if (!data.output_url) {
      throw new Error('No image returned by the API.');
    }

    imgEl.src = data.output_url;
    containerEl.classList.remove('hidden');
    statusEl.textContent = '';
  } catch (err) {
    statusEl.textContent = err.message || 'An unexpected error occurred.';
  }
});
