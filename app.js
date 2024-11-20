// + is good = is okay - is bad

// +
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
    createWritingSelector();
    const title = getWritingTitleFromURL();
    selectWriting(title || stories[0]);
  } else if (pageId === 'projects'){
    handleProjects();
  }
});

// +
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

// +
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

// + Writing Stuff

const stories = [
  "Beyond Life and Death: The Path to You",
  "The Dream"
];

function getWritingTitleFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get('title'); 
  return title ? decodeURIComponent(title) : null; 
}

function selectWriting(writingTitle) {
  const url = new URL(window.location);
  url.searchParams.set('title', writingTitle);
  window.history.pushState({}, '', url);
  handleWriting(writingTitle);
}

function createWritingSelector() {
  const headerWrapper = document.getElementById('writing-header');

  const storySelector = document.createElement('select');
  storySelector.id = 'story-selector';
  
  stories.forEach(story => {
    const option = document.createElement('option');
    option.value = story;
    option.textContent = story;
    storySelector.appendChild(option);
  });
  
  storySelector.onchange = function() {
    selectWriting(this.value); 
  };
  
  headerWrapper.appendChild(storySelector);

  const title = getWritingTitleFromURL();
  if (title) {
    storySelector.value = title;
  }
}

function handleWriting(selectedWriting) {

  document.getElementById('writing-title').innerText = '';
  document.getElementById('writing-byline').innerText = '';
  document.getElementById('writing-content').innerHTML = '';
  document.getElementById('writing-prologue').innerText = '';
  document.getElementById('writing-author-notes').innerText = '';

  fetch('writing/writing.json')
    .then(response => response.json())
    .then(data => {
      let writingTitle = selectedWriting;
      const writing = data.writing.find(item => item.title === writingTitle);

      if (writing) {
        document.getElementById('writing-title').innerText = writing.title;
        document.getElementById('writing-byline').innerText = writing.byline;

        if (writing.prologue) loadPrologue(writing.prologue);
        if (writing.authorNotes) loadAuthorNotes(writing.authorNotes);
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
    
      const keywordMap = {
        'DOTTEDLINE': '<hr style="border-top: 1px dotted #000;">',
      };
    
      const paragraphs = content.split('\n').map(line => 
        keywordMap[line] || `<p>${line}</p>`
      ).join('');
    
      document.getElementById('writing-content').innerHTML = paragraphs;
    }    
    
    async function loadChapters(chapters) {
      const writingContentElement = document.getElementById('writing-content');
      writingContentElement.innerHTML = '';
    
      for (const chapter of chapters) {
        const chapterTitleElement = document.createElement('h4');
        chapterTitleElement.innerText = chapter.chapterTitle;
    
        const keywordMap = {
          'DOTTEDLINE': '<hr style="border-top: 1px dotted #000;">',
        };

        const chapterContent = await fetchTextFromFile(chapter.contentFile);
        const paragraphs = chapterContent.split('\n').map(line => 
          keywordMap[line.trim()] || `<p>${line}</p>`
        ).join('');
    
        writingContentElement.appendChild(chapterTitleElement);
        writingContentElement.innerHTML += paragraphs;
      }
    }

    async function loadPrologue(filePath) {
      const prologue = await fetchTextFromFile(filePath);
      document.getElementById('writing-prologue').innerText = `Prologue: ${prologue}`;
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

// =
function handleShows() {
  const categories = [];
  let currentCategoryIndex = 0;
  const categoryTitle = document.getElementById("showcategory-title");
  const listContainer = document.getElementById("showlist-container");
  const descriptionContainer = document.createElement('p');
  descriptionContainer.classList.add('showlist-description');
  listContainer.appendChild(descriptionContainer);

  async function loadShows() {
    const response = await fetch('shows/shows.json');
    const data = await response.json();
    categories.push(...data);
    updateCategory();
  }

  function updateCategory() {
    const currentCategory = categories[currentCategoryIndex];
    categoryTitle.textContent = currentCategory.genre;

    descriptionContainer.textContent = currentCategory.description;

    listContainer.innerHTML = '';
    listContainer.appendChild(descriptionContainer);

    const ol = document.createElement('ol');
    ol.classList.add('list-group');
    currentCategory.list.forEach((show, index) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.textContent = `${index + 1}. ${show}`;
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

// +
function handleIndex() {
  let animation = false;
  let prevPlanetIndex;

  document.getElementById('randomPlanet').addEventListener('click', function(event) {
    event.preventDefault();

    if (animation) return;

    const planets = document.querySelectorAll('.planet');

    planets.forEach(planet => {
      planet.classList.remove('active');
    });   

    animation = true;

    planets.forEach(planet => {
      planet.classList.add('planet-animating');
    });

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * planets.length);
    } while (randomIndex === prevPlanetIndex);
    
    const chosenPlanet = planets[randomIndex];
    prevPlanetIndex = randomIndex;
    
    setTimeout(() => {
      planets.forEach(planet => {
        planet.classList.remove('planet-animating');
      });

      chosenPlanet.classList.add('active');

      animation = false;
    }, 1500);
  });
}

// =
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

// =
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
        const linksHtml = project.links
          .map(link => 
            `<p class="project-link">${link.name}: <a class="link" href="${link.url}">${link.label}</a></p>`
          )
          .join('');
      
        const projectHtml = `
          <div class="specific-project-container">
            <h2>${project.title}</h2>
            <p>${project.description}</p>
            ${linksHtml}
          </div>
        `;
      
        container.innerHTML += projectHtml;
      });      
    }
}
