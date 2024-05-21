import { getDocumentFromUrl } from "./utils.js";

const config = {
  strings: {
    teraRaid: "tera raid battles",
    mysteryGift: "mystery gifts"
  },
  time: {
    remider_time: 3 * 60 * 60 * 24 * 1000,
  },
  classNames: {
   badge: "filter-badge_wrap",
   gridItem: "filter-grid_gridItem"
  },
  url: {
    mysteryGift: "https://www.nintendolife.com/guides/pokemon-scarlet-and-violet-mystery-gift-codes-list",
    teraRaid: "https://www.dexerto.com/pokemon/pokemon-scarlet-violet-tera-raids-events-date-time-1979387/"
  }
};

const fetchMysteryGifts = async () => {
    const document = await getDocumentFromUrl(config.url.mysteryGift);
    const rows = Array.from(document.querySelectorAll("table")[0].querySelectorAll("tr"));
    rows.splice(0,1);

    return rows.map(row => {
        const td = row.querySelectorAll("td");
        td.haschildre
        return {
            code: cleanUpString(td[0].textContent),
            gift: cleanUpString(td[1].textContent),
            expires: cleanUpString(td[2].textContent)
        }
    });
}

const cleanUpString = (str) => {
    return str.trim().replace(/\n/, "")
}

const gifts = await fetchMysteryGifts();
console.log(gifts)