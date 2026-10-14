async function checkSession() {
  const response = await fetch('/api/auth/me', { cache: 'no-store' });
  if (response.status === 401) window.location.replace('/welcome-page/login.html');
}
window.addEventListener('pageshow', () => checkSession().catch(() => {}));
document.getElementById('logoutButton').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) throw new Error('Logout failed');
    window.location.replace('/welcome-page/login.html');
  } catch {
    alert('Unable to log out. Please try again.');
  }
});
