document.getElementById('mood-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const moodInput = document.getElementById('mood-input');
    const mood = moodInput.value.trim();
    const loadingEl = document.getElementById('loading');
    const resultImg = document.getElementById('result-image');

    if (!mood) {
        loadingEl.textContent = 'Please describe your mood.';
        loadingEl.style.display = 'block';
        resultImg.src = '';
        return;
    }

    loadingEl.style.display = 'block';
    loadingEl.textContent = 'Generating...';
    resultImg.src = '';

    const encodedMood = encodeURIComponent(mood);
    const randomSeed = Date.now().toString();
    // Use loremflickr to generate a unique art painting based on the mood
    const imageUrl = `https://loremflickr.com/800/600/${encodedMood},art,painting?random=${randomSeed}`;

    resultImg.onload = function() {
        loadingEl.style.display = 'none';
    };
    resultImg.onerror = function() {
        loadingEl.style.display = 'block';
        loadingEl.textContent = 'Failed to generate image. Please try again.';
    };

    resultImg.src = imageUrl;
});
