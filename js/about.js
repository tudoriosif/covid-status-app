// Event Listeners
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        let quest = card.querySelector('.quest');
        let cardText = card.querySelector('.card-text');

        quest.classList.toggle('collapsed');
        cardText.classList.toggle('hidden');
    });
});

// Nav toggle
let links = document.getElementById("links");
let ham = document.getElementById("ham");

// Hamburger Toggle Menu
const hamIcons = {
  closing: '<i class="fas fa-times-circle fa-2x"></i>',
  opening: '<i class="fa fa-bars fa-2x"></i>',
};

ham.addEventListener("click", () => {
  if (links.classList.contains("toggle")) {
    links.classList.remove("toggle");
    ham.innerHTML = hamIcons.opening;
  } else {
    links.classList.add("toggle");
    ham.innerHTML = hamIcons.closing;
  }
});