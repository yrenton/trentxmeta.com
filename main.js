// Simple client-side search for the blog listing
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('#search');
  if (!searchInput) return;
  const posts = document.querySelectorAll('.post-item');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    posts.forEach((post) => {
      const title = post.querySelector('h2').textContent.toLowerCase();
      const summary = post.querySelector('.summary').textContent.toLowerCase();
      if (title.includes(query) || summary.includes(query)) {
        post.style.display = '';
      } else {
        post.style.display = 'none';
      }
    });
  });
});