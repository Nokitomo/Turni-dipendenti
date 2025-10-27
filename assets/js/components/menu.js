export function initMenu(router) {
  const menuButton = document.getElementById('menu-button');
  const dropdown = document.getElementById('menu-dropdown');

  if (!menuButton || !dropdown) {
    return;
  }

  const setExpanded = (expanded) => {
    if (expanded) {
      dropdown.classList.remove('hidden');
    } else {
      dropdown.classList.add('hidden');
    }
    menuButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  };

  const toggleMenu = (event) => {
    event.stopPropagation();
    const willOpen = dropdown.classList.contains('hidden');
    setExpanded(willOpen);
  };

  const hideMenu = () => setExpanded(false);

  menuButton.addEventListener('click', toggleMenu);
  document.addEventListener('click', hideMenu);

  dropdown.addEventListener('click', (event) => event.stopPropagation());

  dropdown.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const route = link.getAttribute('data-route');
      hideMenu();
      if (route) {
        router.navigate(route);
      }
    });
  });
}
