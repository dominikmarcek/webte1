const hamburgerBtn = document.getElementById('hamburger-btn');
  const navList = document.getElementById('nav-list');

  hamburgerBtn.addEventListener('click', () => {
    navList.classList.toggle('show');
  });