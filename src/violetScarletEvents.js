import { getDocumentFromUrl } from "./utils.js";

const config = {
  time: {
    remider_time: 3 * 60 * 60 * 24 * 1000,
  },
  teraRaid: {
    url: "https://www.serebii.net/scarletviolet/teraraidbattleevents.shtml",
    classNames: {
        header: "fooleft",
        content: "foocontent",
        image: "picturetd"
    
      },
    strings: {
        datePrefix: "global",
        clickHerePrefix: "click here",
    }
  },
  mysteryGift: {
    url: "https://www.nintendolife.com/guides/pokemon-scarlet-and-violet-mystery-gift-codes-list",
    strings: {
        na: "n/a"
    }
  }
};

const today = new Date();

export const fetchMysteryGifts = async () => {
    const document = await getDocumentFromUrl(config.mysteryGift.url);
    const rows = Array.from(document.querySelectorAll("table")[0].querySelectorAll("tr"));
    rows.splice(0,1);

    return rows.map(row => {
        const td = row.querySelectorAll("td");

        const res = {
            code: cleanUpString(td[0].textContent),
            gift: cleanUpString(td[1].textContent)
        }

        const dateStr = cleanUpString(td[2].textContent).split(" - ")[0].trim();
        if(!stringStartsWith(dateStr, config.mysteryGift.strings.na)) {
            const tokens = dateStr.split(" ");
            const expires = new Date(`${tokens[1]} ${removeLettersFromDay(tokens[0])} ${tokens[2]}`);

            Object.assign(res, {expires: expires})            
        }

        return res;
    });
}

export const fetchTeraRaids = async () => {
    const document = await getDocumentFromUrl(config.teraRaid.url);

    // should all have same length
    const headers = Array.from(document.getElementsByClassName(config.teraRaid.classNames.header));
    const contents = Array.from(document.getElementsByClassName(config.teraRaid.classNames.content));
    const images = Array.from(document.getElementsByClassName(config.teraRaid.classNames.image));

    const notExpiredRaids = [];
    for(let i = 0; i < contents.length; i++) {
        const contentText = contents[i].textContent.split("\n").filter(d => d !== "");
        const dates = contentText.filter(d => stringStartsWith(d, config.teraRaid.strings.datePrefix));

        // Global: May 24th - 26th 2024 format
        // not consistent - some entries have month on both sides, year on both sides, etc 
        dates.forEach(date => {
            const dates = getDates(date);

            // check if expired
            if((dates.end || dates.start).valueOf() - today.valueOf() >= 0) {
                notExpiredRaids.push({
                    title: headers[i].textContent,
                    description: contents[i].querySelector("p").textContent,
                    imgsrc: images[i].querySelector("img").src, 
                    ...dates
                });
            }
        });
    }

    return notExpiredRaids;
}

const getDates = (dateString) => {
    const tokens = dateString.split(":")[1].trim().split(" ").filter(d => d !== "" && d !== "-");

    // omfg
    let start, end;
    if(tokens.length === 6) {
        start = `${tokens[0]} ${removeLettersFromDay(tokens[1])} ${tokens[2]}`;
        end = `${tokens[3]} ${removeLettersFromDay(tokens[4])} ${tokens[5]}`;
    } else if(tokens.length === 5) {
        start = `${tokens[0]} ${removeLettersFromDay(tokens[1])} ${tokens[4]}`;
        end = `${tokens[2]} ${removeLettersFromDay(tokens[3])} ${tokens[4]}`;
    } else if (tokens.length === 4) {
        start = `${tokens[0]} ${removeLettersFromDay(tokens[1])} ${tokens[3]}`;
        end = `${tokens[0]} ${removeLettersFromDay(tokens[2])} ${tokens[3]}`;
    } else {
        start = `${tokens[0]} ${removeLettersFromDay(tokens[1])} ${tokens[2]}`;
    }

    return {
        start: new Date(start),
        end: end ? new Date(end) : undefined
    }
}

const stringStartsWith = (str, prefix) => {
    return str.toLowerCase().startsWith(prefix);
}

const removeLettersFromDay = (str) => {
    return str.replace(/[a-z]+/, "");
}

const cleanUpString = (str) => {
    return str.trim().replace(/\n/, "")
}