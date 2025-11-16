// AI Mood Painter script using Picsum Photos to generate unique images based on mood and timestamp

document.getElementById('mood-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const moodInput = document.getElementById('mood-input');
  const mood = moodInput.value.trim();
  const loadingEl = document.getElementById('loading');
  const resultImg = document.getElementById('result-image');

  // If no mood description is provided, prompt the user and exit
  if (!mood) {
    loadingEl.textContent = 'Please describe your mood.';
    loadingEl.style.display = 'block';
    resultImg.src = '';
    return;
  }

  // Show a loading message while the image is being fetched
  loadingEl.style.display = 'block';
  loadingEl.textContent = 'Generating...';
  resultImg.src = '';

  // Generate a unique seed by combining the mood with the current timestamp
  const seed = encodeURIComponent(`${mood}-${Date.now()}`);
  // Construct the image URL using Picsum Photos with the unique seed
  const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;

  // When the image loads successfully, hide the loading message
  resultImg.onload = function() {
    loadingEl.style.display = 'none';
  };

  // If there is an error loading the image, show an error message
  resultImg.onerror = function() {
    loadingEl.textContent = 'Failed to generate image. Please try again.';
    loadingEl.style.display = 'block';
  };

  // Trigger the image load by setting the src attribute
  resultImg.src = imageUrl;
});
