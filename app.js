document.addEventListener("DOMContentLoaded", function () {
  const pageId = document.getElementById('pageId').textContent.trim();
  handleNav(pageId);

  if (pageId === 'shows') {
    handleShows();
  } else if (pageId === 'index') {
    handleIndex();
  } else if (pageId === 'about') {
    handleAbout();
  } else if (pageId === 'writing') {
    handleWriting("The Portal Unseen");
  } else if (pageId === 'projects'){
    handleProjects();
  }
});

function handleNav(pageId) {
  const navHtml = `
  <header>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <a class="navbar-brand" href="index.html">Milad Sphere</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" id="nav-projects" href="projects.html">Projects</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="nav-shows" href="shows.html">Shows</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="nav-writing" href="writing.html">Writing</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="nav-contact" href="contact.html">Contact</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="nav-about" href="about.html">About</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>`;
  
  document.body.innerHTML = navHtml + document.body.innerHTML;
  setActiveNav(pageId);
}

function setActiveNav(pageId) {
  const navMap = {
    'index': 'nav-index',
    'projects': 'nav-projects',
    'shows': 'nav-shows',
    'writing': 'nav-writing',
    'contact': 'nav-contact',
    'about': 'nav-about'
  };

  const activeNavLink = document.getElementById(navMap[pageId]);
  if (activeNavLink) {
    activeNavLink.classList.add('active');
  }
}


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
    const response = await fetch('shows/shows.txt');
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

  loadTextFile('about/interests.txt', 'interests-list');
  loadTextFile('about/languages.txt', 'languages-list');
  loadTextFile('about/frameworks.txt', 'frameworks-list');
  
  function loadTextFile(filePath, listElementId) {
    fetch(filePath)
      .then(response => response.text())
      .then(text => {
        const items = text.split('\n').map(item => item.trim()).filter(item => item);
        const listElement = document.getElementById(listElementId);
        items.forEach(item => {
          const li = document.createElement('li');
          li.classList.add('list-group-item');
          li.textContent = item;
          listElement.appendChild(li);
        });
      })
      .catch(error => console.error(`Error loading ${filePath}:`, error));
  }
}

function handleProjects(){
  fetch('projects/apps.json')
    .then(response => response.json())
    .then(data => renderProjects(data, 'apps-projects-container'));

  fetch('projects/websites.json')
    .then(response => response.json())
    .then(data => renderProjects(data, 'website-projects-container'));

    function renderProjects(projects, containerId) {
      const container = document.getElementById(containerId);
    
      projects.forEach(project => {
        const projectHtml = `
          <div class="specific-project-container">
            <h2>${project.title}</h2>
            <p>${project.description}</p>
            ${project.website ? `<p class="project-link">Website: <a class="link" href="${project.websiteLink}">${project.website}</a></p>` : ''}
            ${project.download ? `<p class="project-link">Download: <a class="link" href="${project.downloadLink}">${project.download}</a></p>` : ''}
            ${project.github ? `<p class="project-link">GitHub: <a class="link" href="${project.githubLink}">${project.github}</a></p>` : ''}
            ${project.video ? `<p class="project-link">Video: <a class="link" href="${project.videoLink}">${project.video}</a></p>` : ''}
            ${project.longVideo ? `<p class="project-link">Long Video: <a class="link" href="${project.longVideoLink}">${project.longVideo}</a></p>` : ''}
          </div>
        `;
    
        container.innerHTML += projectHtml;
      });
    }
}
