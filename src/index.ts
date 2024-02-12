import { LinksService } from "./links-service";
import { Selector } from "./typings";

(async () => {
  //   const baseLink = "https://landrover.co.uk";
  //   const alternativeBaseLink = "https://www.landrover.co.uk";

  const baseLink = "https://landroverusa.com";
  const alternativeBaseLink = "https://www.landroverusa.com";

  const entryUrl = `${baseLink}/index.html`;

  const selectors: Selector[] = [
    {
      value: ".tertiary-link",
      minOccurrences: 2,
    },
    {
      value: ".tertiary-cta",
      minOccurrences: 0,
    },
    {
      value: "button.secondary-cta",
      minOccurrences: 0,
    },
    {
      value: "button.secondary-link",
      minOccurrences: 0,
    },
    {
      value: ".secondary-cta:not(button)",
      minOccurrences: 0,
    },
    {
      value: ".secondary-link:not(button)",
      minOccurrences: 0,
    },
  ];

  const linksService = new LinksService(
    baseLink,
    alternativeBaseLink,
    selectors
  );

  await linksService.crawl(entryUrl);
})();
