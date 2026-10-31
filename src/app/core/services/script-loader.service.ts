import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

/**
 * Loads classic (non-module) scripts on demand, for jQuery plugins that only one page needs
 * (e.g. Chart.js + jQuery Mapael for the dashboard). Before, they were in angular.json "scripts",
 * so every user downloaded and parsed them on every page, and pages appended a new <script> tag
 * on every visit.
 */
@Injectable({
  providedIn: 'root',
})
export class ScriptLoaderService {
  /** One promise per URL: a library is downloaded and executed once per app session. */
  private readonly loaded = new Map<string, Promise<void>>();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /** Loads the libraries once, in the given order (a plugin after the library it extends). */
  async load(urls: string[]): Promise<void> {
    for (const url of urls) {
      if (!this.loaded.has(url)) {
        const promise = this.inject(url, false);
        promise.catch(() => this.loaded.delete(url)); // a failed download may be retried later
        this.loaded.set(url, promise);
      }
      await this.loaded.get(url);
    }
  }

  /**
   * Executes a page script again (e.g. one that draws charts into the page's current DOM). The tag
   * is removed once it has run, so revisiting the page does not pile up <script> elements.
   */
  run(url: string): Promise<void> {
    return this.inject(url, true);
  }

  private inject(url: string, removeAfterRun: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = url;
      script.async = false;
      script.onload = () => {
        if (removeAfterRun) script.remove();
        resolve();
      };
      script.onerror = () => {
        script.remove();
        reject(new Error(`Could not load ${url}`));
      };
      this.document.body.appendChild(script);
    });
  }
}
