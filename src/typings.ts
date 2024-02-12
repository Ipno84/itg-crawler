import type { Cheerio, AnyNode } from "cheerio";

interface Link {
  href: string;
  crawled: boolean;
  components: string[];
  [key: string]: any;
}

interface ILinksService {
  links: Link[];
  baseLink: string;
  alternativeBaseLink: string;
  addLink: (href: string, selectedElement: Cheerio<AnyNode> | undefined) => boolean;
  selectors: Selector[];
}

interface Selector {
  value: string;
  minOccurrences: number;
}

interface Content {
  total: number;
  uncrawled: number;
  [key: string]: any;
}

export { Link, ILinksService, Selector, Content };
