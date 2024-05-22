import jsdom from "jsdom";

export const getDocumentFromUrl = async (url) => {
    return (await jsdom.JSDOM.fromURL(url)).window.document;
}