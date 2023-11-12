const menuButton = document.getElementById('menu-button');
console.log(menuButton);
const menu = document.getElementById('menu');
console.log(menu);

document.addEventListener('click', (event) => {
	let clickTarget = event.target;

	do {
        if (clickTarget === menuButton) {
            return;
        }

		if (clickTarget === menu) {
			return;
		}

		clickTarget = clickTarget.parentNode;
	} while (clickTarget);
	if (menu.classList.contains('menu-opened')) {
		menu.classList.toggle('menu-closed');
		menu.classList.toggle('menu-opened');
	}
});

menuButton.addEventListener('click', (event) => {
	menu.classList.toggle('menu-closed');
	menu.classList.toggle('menu-opened');
});
