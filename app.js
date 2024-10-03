document.addEventListener("DOMContentLoaded", function () {
  const pageId = document.getElementById('pageId').textContent.trim();
  if (pageId === 'shows') {
    handleShows();
  } else if(pageId === 'index'){
    handleIndex();
  } else if (pageId === 'about'){
    handleAbout();
  } else if(pageId === 'writing'){
    handleWriting();
  }
});

function handleWriting() {
  loadWriting("writing/The Dream");

  async function fetchTextFromFile(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Error fetching ${filePath}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error:', error);
      return '';
    }
  }

  async function loadWriting(storyFolder) {
    try {
      const title = await fetchTextFromFile(`${storyFolder}/Title.txt`);
      const content = await fetchTextFromFile(`${storyFolder}/Content.txt`);
      const authorNotes = await fetchTextFromFile(`${storyFolder}/AuthorNotes.txt`);

      document.getElementById('writing-title').innerText = title;

      // Wrap each line of content in <p> tags
      const paragraphs = content.split('\n').map(line => `<p>${line}</p>`).join('');
      document.getElementById('writing-content').innerHTML = paragraphs;

      document.getElementById('writing-author-notes').innerText = `Author Notes: ${authorNotes}`;
    } catch (error) {
      console.error('Error loading writing:', error);
    }
  }
}

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

function handleIndex() {
  let spinInterval;
  let totalSpin = 0;
  let spinning = false;

  document.getElementById('randomPlanet').addEventListener('click', function(event) {
    event.preventDefault();

    if (spinning) return;

    const arrow = document.getElementById('randomArrow');
    const planets = document.querySelectorAll('.planet');
    const spinTime = Math.random() * 5000;

    arrow.style.transformOrigin = '50% 50%';

    spinning = true;

    spinInterval = setInterval(() => {
      totalSpin += 20;
      arrow.style.transform = `rotate(${totalSpin}deg)`;
    }, 50);

    setTimeout(() => {
      clearInterval(spinInterval);

      const randomIndex = Math.floor(Math.random() * planets.length);
      const chosenPlanet = planets[randomIndex];

      const chosenPlanetCoords = chosenPlanet.getBoundingClientRect();
      const arrowCoords = arrow.getBoundingClientRect();

      const arrowCenterX = arrowCoords.left + arrowCoords.width / 2;
      const arrowCenterY = arrowCoords.top + arrowCoords.height / 2;
      const planetCenterX = chosenPlanetCoords.left + chosenPlanetCoords.width / 2;
      const planetCenterY = chosenPlanetCoords.top + chosenPlanetCoords.height / 2;

      const angle = Math.atan2(
        planetCenterY - arrowCenterY,
        planetCenterX - arrowCenterX
      ) * (180 / Math.PI);

      arrow.style.transform = `rotate(${angle}deg)`;

      spinning = false;
    }, spinTime);
  });
}

function handleAbout(){
  const birthDate = new Date("2006-11-30");
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const ageSpan = document.getElementById("about-age"); 
  ageSpan.textContent = age;
}
