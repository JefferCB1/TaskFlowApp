// comment_renderer.js
window.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    const commentText = document.getElementById('comment-text');

    commentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Enviamos el texto del comentario al proceso principal
        window.api.submitComment(commentText.value);
    });
});