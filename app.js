document.addEventListener("DOMContentLoaded", function () {
  const pageId = document.getElementById('pageId').textContent.trim();
  if (pageId === 'shows') {
    handleShows();
  } else if(pageId === 'index'){
    handleIndex();
  } else if (pageId === 'about'){
    handleAbout();
  } else if(pageId === 'writing'){
    handleWriting("The Portal Unseen");
  }
});

function handleWriting(selectedWriting) {
  fetch('writing/writing.json')
    .then(response => response.json())
    .then(data => {
      let writingTitle = selectedWriting;
      const writing = data.writing.find(item => item.title === writingTitle);

      if (writing) {
        document.getElementById('writing-title').innerText = writing.title;
        document.getElementById('writing-byline').innerText = writing.byline;
        loadAuthorNotes(writing.authorNotes);

        if (writing.chapters) {
          loadChapters(writing.chapters);
        } else {
          loadContent(writing.contentFile);
        }

      } else {
        console.error('Writing not found');
      }
    })
    .catch(error => console.error('Error loading writing data:', error));

    async function loadContent(filePath) {
      const content = await fetchTextFromFile(filePath);
      const paragraphs = content.split('\n').map(line => `<p>${line}</p>`).join('');
      document.getElementById('writing-content').innerHTML = paragraphs;
    }
    
    async function loadChapters(chapters) {
      const writingContentElement = document.getElementById('writing-content');
      writingContentElement.innerHTML = '';
    
      for (const chapter of chapters) {
        const chapterTitleElement = document.createElement('h4');
        chapterTitleElement.innerText = chapter.chapterTitle;
    
        const chapterContent = await fetchTextFromFile(chapter.contentFile);
        const paragraphs = chapterContent.split('\n').map(line => `<p>${line}</p>`).join('');
    
        writingContentElement.appendChild(chapterTitleElement);
        writingContentElement.innerHTML += paragraphs;
      }
    }
    
    async function loadAuthorNotes(filePath) {
      const authorNotes = await fetchTextFromFile(filePath);
      document.getElementById('writing-author-notes').innerText = `Author Notes: ${authorNotes}`;
    }

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
  let spinning = false;

  document.getElementById('randomPlanet').addEventListener('click', function(event) {

    event.preventDefault();

    if (spinning) return;

    let totalSpin = 0;

    const arrow = document.getElementById('randomArrow');
    const planets = document.querySelectorAll('.planet');
    const spinTime = 3000;

    planets.forEach(planet => {
      planet.classList.remove('active');
    });   

    arrow.style.transform = `rotate(0deg)`;
    arrow.style.transformOrigin = '50% 50%';
    arrow.classList.remove('no-display');
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

      const offset = -30;
      const finalRotation = totalSpin + angle + offset;

      console.log(`Total Spin: ${totalSpin}, Angle: ${angle}, Final Rotation: ${finalRotation}`);

      arrow.style.transform = `rotate(${finalRotation}deg)`;
      chosenPlanet.classList.add('active');

      setTimeout(() => {
          arrow.classList.add('no-display');
          spinning = false;
      }, 1000);

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
