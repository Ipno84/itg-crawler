import axios from "axios";
import { CheerioAPI, load, AnyNode, Cheerio } from "cheerio";
import type { ILinksService } from "./typings";

class CrawlerService {
  private url: string = "";
  private html: string = "";
  private selector: CheerioAPI | null = null;
  private linksService: ILinksService;

  constructor(url: string, linksService: ILinksService) {
    this.url = url;
    this.linksService = linksService;

    this.findAncestorComponent = this.findAncestorComponent.bind(this);
  }

  private async fetchData() {
    try {
      const response = await axios(this.url);

      if (response.status !== 200) {
        throw new Error(`Failed to fetch data for: ${this.url}`);
      }

      return response.data;
    } catch (error: any) {
      console.log("Error: ", error.message);
      return "";
    }
  }

  private async getHtml() {
    this.html = await this.fetchData();
  }

  private async getSelector() {
    this.selector = load(this.html);
  }

  private registerNewLinks() {
    this.selector?.("a").each((_, element) => {
      const selectedElement = this.selector?.(element);

      let href = selectedElement?.attr("href");

      if (!href || !href.endsWith(".html")) return;

      if (href.startsWith("/")) {
        href = this.linksService.baseLink + href;
      }

      if (href.includes(this.linksService.alternativeBaseLink)) {
        href = href.replace("www.", "");
      }

      if (href.includes(this.linksService.baseLink)) {
        this.linksService.addLink(href, selectedElement);
      }
    });
  }

  private findAncestorComponent(
    selectedElement: Cheerio<AnyNode> | undefined
  ): string {
    let ancestor = selectedElement?.parent();

    while (ancestor && ancestor.length > 0) {
      if (ancestor.attr("data-component")) {
        return ancestor.attr("data-component") ?? "";
      }
      ancestor = ancestor.parent();
    }

    return "";
  }

  private checkForSelectors() {
    this.linksService.selectors.forEach(({ value }) => {
      const elements = this.selector?.(value);
      const elementsCount = elements?.length;

      if (elementsCount) {
        const crawlingLink = this.linksService.links.find(
          (link) => link.href === this.url
        );

        if (crawlingLink) {
          crawlingLink[value] = elementsCount;

          elements.each((_, node) => {
            const selectedNode = this.selector?.(node);
            const anchestorComponent = this.findAncestorComponent(selectedNode);
            crawlingLink.components.push(anchestorComponent);
          });
        }
      }
    });
  }

  public async crawl() {
    await this.getHtml();
    await this.getSelector();

    this.registerNewLinks();

    const crawlingLink = this.linksService.links.find(
      (link) => link.href === this.url
    );

    this.checkForSelectors();

    if (crawlingLink) {
      crawlingLink.crawled = true;
    }
  }
}

export { CrawlerService };
