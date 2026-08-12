import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from '../site-footer/site-footer';
import { SiteHeader } from '../site-header/site-header';

/**
 * Root layout shell — header + `<router-outlet>` + footer. Every route in
 * this change composes into this shell (app-shell spec: "Every route renders
 * through the shell"). `app.ts` renders this and nothing else.
 */
@Component({
  selector: 'pz-shell',
  imports: [SiteHeader, RouterOutlet, SiteFooter],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
