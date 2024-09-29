document.addEventListener("DOMContentLoaded", function () {
  const pageId = document.getElementById('pageId').textContent.trim();
  if (pageId === 'shows') {
    handleShows();
  }
});

function handleShows() {
  const categories = [];
  let currentCategoryIndex = 0;
  const categoryTitle = document.getElementById("showcategory-title");
  const listContainer = document.getElementById("showlist-container");
  const descriptionContainer = document.createElement('p');
  descriptionContainer.classList.add('showlist-description');
  listContainer.appendChild(descriptionContainer);

  async function loadShows() {
    const response = await fetch('media/shows.txt');
    const text = await response.text();
    parseShows(text);
    updateCategory();
  }

  function parseShows(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    let currentCategory = null;

    lines.forEach(line => {
      if (line.endsWith(':')) {
        currentCategory = { name: line.replace(':', ''), shows: [], description: '' };
        categories.push(currentCategory);
      } else if (line.startsWith('Description')) {
        currentCategory.description = line.replace('Description - ', '');
      } else if (currentCategory) {
        currentCategory.shows.push(line);
      }
    });
  }

  function updateCategory() {
    const currentCategory = categories[currentCategoryIndex];
    categoryTitle.textContent = currentCategory.name;

    descriptionContainer.textContent = currentCategory.description;

    listContainer.innerHTML = '';
    listContainer.appendChild(descriptionContainer);

    const ol = document.createElement('ol');
    ol.classList.add('list-group');
    currentCategory.shows.forEach(show => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.textContent = show;
      ol.appendChild(li);
    });
    listContainer.appendChild(ol);
  }

  document.getElementById('prev-category').addEventListener('click', function () {
    currentCategoryIndex = (currentCategoryIndex === 0) ? categories.length - 1 : currentCategoryIndex - 1;
    updateCategory();
  });

  document.getElementById('next-category').addEventListener('click', function () {
    currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    updateCategory();
  });

  loadShows();
}
