const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => {
  const isOpen = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: .14 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
