const navElements = {
  my: {
    value: "hideMy",
    selector: 'a[href$="/personal"]',
  },
  promo: {
    value: "hidePromo",
    selector: 'a[href$="/promo"]',
  },
  channels: {
    value: "hideChannels",
    selector: 'a[href$="/channels"]',
  },
  sport: {
    value: "hideSport",
    selector: 'a[href$="/sport/"]',
  },
  games: {
    value: "hideGames",
    selector: 'a[href$="/games"]',
  },
};

const defaultConfig = {
  hideMy: false,
  hidePromo: false,
  hideChannels: false,
  hideGames: false,
  changeBase: false,
  removeChild: false,
  removeTV: false,
  addGenres: false,
  addToTopBtn: false,
  addSelections: false,
};

if (!browser) {
  var browser = chrome;
}

function getResourceContent(fileName) {
  return fetch(browser.runtime.getURL(`resources/${fileName}`)).then((resp) =>
    resp.json()
  );
}

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    onUrlChange();
  }
}).observe(document, { subtree: true, childList: true });

function onUrlChange() {
  setTimeout(() => main(), 300);
}

let navBar;
let resourcesContent;

main();

async function main() {
  const { config } = (await browser.storage.local.get("config")) ?? {
    config: defaultConfig,
  };

  navBar = document.querySelector(`nav>ul`) ?? document.querySelector("nav");

  Object.entries(navElements).forEach(([key, { value, selector }]) => {
    const status = config[value];
    if (status) removeFromNav(selector);
  });

  if (config.removeChild)
    document
      .querySelector('button[aria-label="Войти в профиль Дети"]')
      ?.remove();
  //TODO one day - replace block with for of

  if (config.removeTV)
    document.querySelector('a[href*="/smarttv_instruction"]')?.remove();

  if (config.changeBase) {
    document
      .querySelectorAll('a[href="https://www.kinopoisk.ru/"]')
      .forEach((elem) => elem.setAttribute("href", "https://hd.kinopoisk.ru/"));
  }

  if (config.addGenres) {
    addGenres();
  }

  if (config.addToTopBtn) {
    createToTopBtn();
  }

  if (config.addSelections) {
    addSelections();
  }
}

function createToTopBtn() {
  const container = document.getElementById("__next") ?? document.body;
  const elem = document.createElement("button");

  const svgIcon = document.createElement("div");
  svgIcon.innerHTML = `<svg  enable-background="new 0 0 32 32" height="32px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M18.221,7.206l9.585,9.585c0.879,0.879,0.879,2.317,0,3.195l-0.8,0.801c-0.877,0.878-2.316,0.878-3.194,0  l-7.315-7.315l-7.315,7.315c-0.878,0.878-2.317,0.878-3.194,0l-0.8-0.801c-0.879-0.878-0.879-2.316,0-3.195l9.587-9.585  c0.471-0.472,1.103-0.682,1.723-0.647C17.115,6.524,17.748,6.734,18.221,7.206z" fill="#ff5500"/></svg>`;
  elem.append(svgIcon);

  elem.classList.add("ext_toTop", "ext_hidden");
  container.append(elem);

  elem.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  document.addEventListener("scroll", (e) => {
    const scrollY = window.scrollY;
    if (scrollY < 200) elem.classList.add("ext_hidden");
    else elem.classList.remove("ext_hidden");
  });
}

function removeFromNav(selector) {
  navBar.querySelector(selector)?.parentElement?.remove();
}

function createNavItem(name, id) {
  const newNavItem = navBar.childNodes[0].cloneNode(true);
  newNavItem.classList.add("ext-nav");
  newNavItem.setAttribute("id", id);
  const inner = document.createElement("div");
  inner.classList.add("ext-nav--inner");
  inner.innerText = name;

  newNavItem.replaceChild(inner, newNavItem.childNodes[0]);
  return newNavItem;
}

async function addSelections() {
  const isAlreadyExist = navBar.querySelector(`#selection_ext`);
  if (isAlreadyExist) return;
  const newNavItem = createNavItem("Подборки", "selection_ext");

  if (!resourcesContent) {
    resourcesContent = await getResourceContent("data.json");
  }

  const container = document.createElement("div");
  container.classList.add("ext-container");
  const selectionList = document.createElement("ul");

  resourcesContent.selections.forEach(({ href, title }) => {
    const element = document.createElement("li");
    const link = document.createElement("a");
    link.setAttribute("href", href);
    link.textContent = `${title}`;
    element.append(link);
    selectionList.append(element);
  });

  container.append(selectionList);
  newNavItem.appendChild(container);
  navBar.append(newNavItem);
}

async function addGenres() {
  const isAlreadyExist = navBar.querySelector(`#genres_ext`);
  if (isAlreadyExist) return;

  const newNavItem = createNavItem("Жанры", "genres_ext");

  if (!resourcesContent) {
    resourcesContent = await getResourceContent("data.json");
  }

  const genresContainer = document.createElement("div");
  genresContainer.classList.add("ext-container");
  const genresList = document.createElement("ul");

  resourcesContent.genresList.forEach((genre) => {
    const newGenreElem = createGenreElement(genre.title, genre.img, genre.href);
    genresList.append(newGenreElem);
  });

  genresContainer.append(genresList);
  newNavItem.appendChild(genresContainer);
  navBar.append(newNavItem);
}

function createGenreElement(title, imgUrl, href) {
  const genreElement = document.createElement("li");
  genreElement.classList.add("genres-item");
  const link = document.createElement("a");
  const img = document.createElement("div");
  img.style.backgroundImage = `url(${imgUrl})`;
  img.classList.add("genres-item--img");
  img.setAttribute("role", "img");
  img.setAttribute("aria-label", title);
  img.setAttribute("title", title);
  link.append(img);
  link.setAttribute("href", href);
  genreElement.append(link);
  return genreElement;
}
