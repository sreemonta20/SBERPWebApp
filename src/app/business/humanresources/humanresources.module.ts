import { NgModule } from '@angular/core';

import { HumanResourcesRoutingModule } from './humanresources.routes';

/**
 * HumanResources business module — the parent of the 9 HR sub-modules (Core HR, Organization Setup
 * … Separation). It declares no screens itself: each sub-module is lazy-loaded by
 * humanresources.routes.ts and declares its own components.
 */
@NgModule({
  imports: [HumanResourcesRoutingModule],
})
export class HumanResourcesModule {}
