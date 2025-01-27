const defaultConfig = {
  hideMy: false,
  hidePromo: false,
  hideChannels: false,
  hideGames: false,
  changeBase: false,
  removeChild: false,
  addGenres: false,
  addToTopBtn: false,
  addSelections: false,
};

const inputs = document.querySelectorAll('input[type="checkbox"]');

if (!browser) {
  var browser = chrome;
}

async function main() {
  const data = (await browser.storage.local.get("config")) ?? defaultConfig;
  const config = data?.config || defaultConfig;
  const saveChanges = async (e) => {
    const name = e.target.getAttribute("name");
    const value = e.target.checked;
    config[name] = value;
    await browser.storage.local.set({ config: config });
  };

  inputs.forEach((input) => {
    input.checked = config ? config[input.getAttribute("name")] : false;
    input.addEventListener("click", saveChanges);
  });
}

main();
