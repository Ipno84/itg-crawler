import fs from "fs";
import type { Content, ILinksService, Link, Selector } from "./typings";
import { CrawlerService } from "./crawler-service";
import { AnyNode, Cheerio } from "cheerio";

class LinksService implements ILinksService {
  private _links: Link[] = [];
  private _baseLink: string = "";
  private _alternativeBaseLink: string = "";
  private _selectors: Selector[] = [];
  private filename: string = "output.json";

  constructor(
    baseLink: string,
    alternativeBaseLink: string,
    selectors: Selector[]
  ) {
    this._baseLink = baseLink;
    this._alternativeBaseLink = alternativeBaseLink;
    this._selectors = selectors;
    this.filename = new URL(baseLink).hostname + ".json";
  }

  public get links(): Link[] {
    return this._links;
  }

  public get baseLink(): string {
    return this._baseLink;
  }

  public get alternativeBaseLink(): string {
    return this._alternativeBaseLink;
  }

  public get selectors(): Selector[] {
    return this._selectors;
  }

  private isLinkAlreadyInQueue(href: string): boolean {
    const linkInstance = this.links.find((link) => link.href === href);
    return Boolean(linkInstance);
  }

  public addLink(
    href: string,
    selectedElement: Cheerio<AnyNode> | undefined
  ): boolean {
    const isLinkAlreadyInQueue = this.isLinkAlreadyInQueue(href);

    if (!isLinkAlreadyInQueue) {
      this._links.push({
        crawled: false,
        components: [],
        href,
      });

      return true;
    }

    return false;
  }

  private getFirstUncrawledLink() {
    const links = this.links.filter((link) => link.crawled === false);

    if (links.length > 0) return links[0];

    return null;
  }

  public async crawl(url: string) {
    let crawlerService;

    crawlerService = new CrawlerService(url, this);

    await crawlerService.crawl();

    const firstUncrawledLink = this.getFirstUncrawledLink();

    crawlerService = undefined;

    console.clear();

    const percentage =
      (this.links.filter((link) => link.crawled === false).length * 100) /
      this.links.length;

    console.log("Progress: \x1b[36m%d%%\x1b[0m", (100 - percentage).toFixed(2));

    if (firstUncrawledLink) {
      await this.crawl(firstUncrawledLink.href);
    }

    let content: Content = {
      total: this.links.length,
      uncrawled: this.links.filter((link) => link.crawled === false).length,
    };

    this.selectors.forEach(({ value, minOccurrences }) => {
      const items = this.links
        .filter((link) => link[value] > minOccurrences)
        .map((link) => ({
          href: link.href,
          count: link[value],
          components: [...new Set(link.components)].filter(Boolean),
        }));

      content[`with${value}`] = items;
    });

    const stringifiedContent = JSON.stringify(content, null, 2);

    fs.writeFileSync(`results/${this.filename}`, stringifiedContent);
  }
}

export { LinksService };
