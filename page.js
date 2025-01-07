const navElements = {
  my: {
    value: "hideMy",
    selector: 'a[href="/personal"]',
  },
  promo: {
    value: "hidePromo",
    selector: 'a[href="/promo"]',
  },
  channels: {
    value: "hideChannels",
    selector: 'a[href="/channels"]',
  },
  sport: {
    value: "hideSport",
    selector: 'a[href="https://hd.kinopoisk.ru/sport/"]',
  },
  games: {
    value: "hideGames",
    selector: 'a[href="/games"]',
  },
};

function getResourceContent(fileName) {
  return fetch(chrome.runtime.getURL(`resources/${fileName}`)).then((resp) =>
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

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    main();
  }
};

async function main() {
  const { config } = (await chrome.storage.local.get("config")) ?? {};
  const navBar = document.querySelector(`nav>ul`);

  Object.entries(navElements).forEach(([key, { value, selector }]) => {
    const status = config ? config[value] ?? false : false;
    if (status) removeFromNav(selector);
  });
  const isChangeBase = config["changeBase"] ?? false;
  const isRemoveChilds = config["removeChild"] ?? false;
  const isAddGenresPage = config["addGenres"] ?? false;

  if (isRemoveChilds)
    document
      .querySelector('button[aria-label="Войти в профиль Дети"]')
      ?.remove();

  if (isChangeBase)
    document
      .querySelectorAll('a[href="https://www.kinopoisk.ru/"]')
      .forEach((elem) => elem.setAttribute("href", "https://hd.kinopoisk.ru/"));

  if (isAddGenresPage) {
    addGenres();
  }
  function removeFromNav(selector) {
    navBar.querySelector(selector)?.parentElement?.remove();
  }
  function createNavItem(name) {
    const newNavItem = navBar.childNodes[0].cloneNode(true);
    newNavItem.classList.add("ext-nav");

    const inner = document.createElement("div");
    inner.classList.add("ext-nav--inner");
    inner.innerText = name;

    newNavItem.replaceChild(inner, newNavItem.childNodes[0]);
    return newNavItem;
  }

  async function addGenres() {
    const newNavItem = createNavItem("Жанры");
    newNavItem.setAttribute("id", "genres_ext");

    const content = await getResourceContent("data.json");

    const genresContainer = document.createElement("div");
    genresContainer.classList.add("genres-container");
    const genresList = document.createElement("ul");
    content.genresList.forEach((genre) => {
      const genreElement = document.createElement("li");
      genreElement.classList.add("genres-item");
      const link = document.createElement("a");
      const img = document.createElement("div");
      img.style.backgroundImage = `url(${genre.img})`;
      img.classList.add("genres-item--img");
      img.setAttribute("role", "img");
      img.setAttribute("aria-label", genre.title);
      img.setAttribute("title", genre.title);
      link.append(img);
      link.setAttribute("href", genre.href);
      genreElement.append(link);
      genresList.append(genreElement);
    });
    genresContainer.append(genresList);
    newNavItem.appendChild(genresContainer);
    navBar.append(newNavItem);
  }
}

// navBar.querySelector('a[href="/games"]').parentElement.remove();
