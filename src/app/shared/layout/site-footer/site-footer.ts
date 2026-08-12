import { Component } from '@angular/core';
import { SITE, type Site } from '../../site';

/**
 * Site-wide footer. Renders NAP (Name, Address, Phone) from the single `SITE`
 * constant — never hardcoded per route (app-shell spec: "NAP consistency").
 */
@Component({
  selector: 'app-site-footer',
  imports: [],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly site: Site = SITE;
  protected readonly year = new Date().getFullYear();
}
