// Main JavaScript for Trent X Meta site
// This script adds simple search functionality to the blog page.

document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('search');
  const postList = document.getElementById('post-list');
  if (search && postList) {
    const posts = postList.querySelectorAll('li');
    search.addEventListener('input', function () {
      const filter = this.value.toLowerCase();
      posts.forEach((post) => {
        const text = post.textContent.toLowerCase();
        if (text.includes(filter)) {
          post.style.display = '';
        } else {
          post.style.display = 'none';
        }
      });
    });
  }
});