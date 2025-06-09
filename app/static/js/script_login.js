window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const nameInput = form.querySelector('input[name="name"]');
  const errorText = document.getElementById('errorText');

  if (errorText && errorText.textContent.trim() !== '') {
    errorText.classList.add('visible');
    nameInput.classList.add('error');
  }

  nameInput.addEventListener('input', () => {
    if (errorText) {
      errorText.classList.remove('visible');
    }
    nameInput.classList.remove('error');
  });
});

