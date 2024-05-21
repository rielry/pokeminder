import { getDocumentFromUrl } from "./utils.js";

const config = {
  strings: {
    communityDay: "community day",
    incenseDay: "incense day",
  },
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  time: {
    remider_time: 3 * 60 * 60 * 24 * 1000,
  },
  classNames: {
    blogPosts: "blogList__posts",
    blogPostContent: "blogList__post__content",
    postDate: "blogList__post__content__date",
    postTitle: "blogList__post__content__title",
    post: {
      headline: "ContainerBlock__headline__title",
      body: "ContainerBlock__body",
    },
  },
  url: "https://pokemongolive.com/news?hl=en",
};

const today = new Date();
const currentMonth = today.getMonth() - 1;

export const getUpcomingCommunityDays = async () => {
  const document =  await getDocumentFromUrl(config.url);
  const blogPosts = Array.from(
    document.getElementsByClassName(config.classNames.blogPosts)[0].childNodes
  ).filter((d) => d.hasChildNodes());
  const communityDays = (
    await Promise.all(blogPosts.map((post) => parseBlogPost(post)))
  ).filter((d) => !!d);

  return communityDays;
};

const parseBlogPost = async (post) => {
  const title = post
    .getElementsByClassName(config.classNames.postTitle)[0]
    .innerHTML.trim();
  const titleTokens = title.split(" ");
  const month = titleTokens[0].trim();

  const isUpcoming = config.months.indexOf(month) >= currentMonth;

  if (isUpcoming && title.toLowerCase().includes(config.strings.communityDay)) {
    const pokemon = titleTokens[titleTokens.length - 1].trim();
    const dateAndTime = await getDateAndTime(post.href);
    const date = new Date(dateAndTime.match(/[a-zA-Z]+ [0-9]{1,2}, [0-9]{4}/));

    return {
      date: date,
      dateAndTime: dateAndTime,
      title: title,
      pokemon: pokemon,
      url: post.href,
    };
  }
};

const getDateAndTime = async (url) => {
  const document = await getDocumentFromUrl(url);
  return document.getElementsByClassName(config.classNames.post.body)[0]
    .firstChild.innerHTML;
};
