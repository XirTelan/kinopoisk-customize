const defaultConfig = {
  hideMy: false,
  hidePromo: false,
  hideChannels: false,
  hideGames: false,
  changeBase: false,
  removeChild: false,
  addGenres: false,
};
const inputs = document.querySelectorAll('input[type="checkbox"]');

(async function main() {
  const data = (await chrome.storage.local.get("config")) ?? defaultConfig;
  const config = data?.config || defaultConfig;
  const saveChanges = async (e) => {
    const name = e.target.getAttribute("name");
    const value = e.target.checked;
    config[name] = value;
    await chrome.storage.local.set({ config: config });
  };

  inputs.forEach((input) => {
    input.checked = config ? config[input.getAttribute("name")] : false;
    input.addEventListener("click", saveChanges);
  });
})();
